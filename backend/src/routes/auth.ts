import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { deleteCookie, getCookie } from "hono/cookie";
import { z } from "zod";

import { user, verification } from "../db/schema";
import { sendAuthEmail } from "../lib/auth";
import { createDb } from "../lib/db";
import { persistGuestCookie, resolveUser } from "../lib/guest-session";

import type { HonoEnv } from "../lib/factory";

const guestBootstrapRoute = createRoute({
  method: "post",
  path: "/guest",
  tags: ["Auth"],
  responses: {
    200: {
      description: "Ensure a guest or authenticated session exists",
      content: {
        "application/json": {
          schema: z.object({
            userId: z.string().min(1),
            isGuest: z.boolean(),
          }),
        },
      },
    },
  },
});

const successResponseSchema = z.object({ success: z.boolean() });
const errorResponseSchema = z.object({ error: z.string() });

const linkEmailBodySchema = z.object({
  email: z.string().email(),
});

const linkEmailRoute = createRoute({
  method: "post",
  path: "/link-email",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: linkEmailBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Verification email sent",
      content: { "application/json": { schema: successResponseSchema } },
    },
    400: {
      description: "Bad request",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    409: {
      description: "Conflict",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const verifyEmailRoute = createRoute({
  method: "get",
  path: "/verify-email",
  tags: ["Auth"],
  request: {
    query: z.object({ token: z.string() }),
  },
  responses: {
    302: { description: "Redirect after verification" },
  },
});

const sendMagicLinkBodySchema = z.object({
  email: z.string().email(),
});

const sendMagicLinkRoute = createRoute({
  method: "post",
  path: "/send-magic-link",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: sendMagicLinkBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Magic link sent",
      content: { "application/json": { schema: successResponseSchema } },
    },
    400: {
      description: "Bad request",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const verifyLoginRoute = createRoute({
  method: "get",
  path: "/verify-login",
  tags: ["Auth"],
  request: {
    query: z.object({ token: z.string() }),
  },
  responses: {
    302: { description: "Redirect after login" },
  },
});

export const authRouter = new OpenAPIHono<HonoEnv>();

authRouter.openapi(guestBootstrapRoute, async (c) => {
  const session = await resolveUser(c);
  return c.json(session, 200);
});

authRouter.openapi(linkEmailRoute, async (c) => {
  const db = createDb(c.env);
  const { userId, isGuest } = await resolveUser(c);

  if (!isGuest) {
    return c.json({ error: "Już jesteś zalogowany" }, 400);
  }

  const body = c.req.valid("json");
  const email = body.email.toLowerCase().trim();

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing.length > 0 && !existing[0].isGuest) {
    return c.json(
      { error: "Ten adres e-mail jest już przypisany do innego konta" },
      409,
    );
  }

  await db
    .update(user)
    .set({
      email,
      isGuest: false,
      emailVerified: false,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));

  const token = crypto.randomUUID();
  await db.insert(verification).values({
    id: crypto.randomUUID(),
    identifier: `guest-verify:${token}`,
    value: JSON.stringify({ userId, email, type: "verify" }),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const frontendUrl = (c.env.FRONTEND_URL ?? c.env.BETTER_AUTH_URL)
    .split(",")[0]
    .trim();
  const verifyUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

  await sendAuthEmail(
    c.env,
    email,
    "Potwierdź swój adres e-mail w Recurs",
    `<p>Kliknij poniższy link, aby potwierdzić swój adres e-mail:</p><a href="${verifyUrl}">${verifyUrl}</a><p>Link wygasa za 10 minut.</p>`,
  );

  return c.json({ success: true }, 200);
});

authRouter.openapi(verifyEmailRoute, async (c) => {
  const db = createDb(c.env);
  const token = c.req.query("token");
  if (!token) {
    return c.redirect("/today?error=missing_token", 302);
  }

  const rows = await db
    .select()
    .from(verification)
    .where(eq(verification.identifier, `guest-verify:${token}`))
    .limit(1);

  if (rows.length === 0 || rows[0].expiresAt < new Date()) {
    return c.redirect("/today?error=invalid_token", 302);
  }

  const payload = JSON.parse(rows[0].value) as {
    userId: string;
    email: string;
  };

  await db.delete(verification).where(eq(verification.id, rows[0].id));

  await db
    .update(user)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(user.id, payload.userId));

  persistGuestCookie(c, payload.userId);

  return c.redirect("/today", 302);
});

authRouter.openapi(sendMagicLinkRoute, async (c) => {
  const db = createDb(c.env);
  const body = c.req.valid("json");
  const email = body.email.toLowerCase().trim();

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing.length === 0 || existing[0].isGuest) {
    return c.json({ error: "Nie znaleziono konta z tym adresem e-mail" }, 404);
  }

  const token = crypto.randomUUID();
  await db.insert(verification).values({
    id: crypto.randomUUID(),
    identifier: `guest-login:${token}`,
    value: JSON.stringify({ email, type: "login" }),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const frontendUrl = (c.env.FRONTEND_URL ?? c.env.BETTER_AUTH_URL)
    .split(",")[0]
    .trim();
  const loginUrl = `${frontendUrl}/verify-login?token=${encodeURIComponent(token)}`;

  await sendAuthEmail(
    c.env,
    email,
    "Zaloguj się do Recurs",
    `<p>Kliknij poniższy link, aby się zalogować:</p><a href="${loginUrl}">${loginUrl}</a><p>Link wygasa za 10 minut.</p>`,
  );

  return c.json({ success: true }, 200);
});

authRouter.openapi(verifyLoginRoute, async (c) => {
  const db = createDb(c.env);
  const token = c.req.query("token");
  if (!token) {
    return c.redirect("/today?error=missing_token", 302);
  }

  const rows = await db
    .select()
    .from(verification)
    .where(eq(verification.identifier, `guest-login:${token}`))
    .limit(1);

  if (rows.length === 0 || rows[0].expiresAt < new Date()) {
    return c.redirect("/today?error=invalid_token", 302);
  }

  const payload = JSON.parse(rows[0].value) as { email: string };

  await db.delete(verification).where(eq(verification.id, rows[0].id));

  const targetUser = await db
    .select()
    .from(user)
    .where(eq(user.email, payload.email))
    .limit(1);

  if (targetUser.length === 0 || targetUser[0].isGuest) {
    return c.redirect("/today?error=account_not_found", 302);
  }

  const targetUserId = targetUser[0].id;

  const currentGuestId = getCookie(c, "guest_user_id");
  if (currentGuestId && currentGuestId !== targetUserId) {
    const currentUser = await db
      .select({ isGuest: user.isGuest })
      .from(user)
      .where(eq(user.id, currentGuestId))
      .limit(1);

    if (currentUser.length > 0 && currentUser[0].isGuest) {
      await db.delete(user).where(eq(user.id, currentGuestId));
    }
  }

  persistGuestCookie(c, targetUserId);

  return c.redirect("/today", 302);
});

const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  tags: ["Auth"],
  responses: {
    200: {
      description: "Logged out",
      content: { "application/json": { schema: successResponseSchema } },
    },
  },
});

authRouter.openapi(logoutRoute, async (c) => {
  const secure = c.env.BETTER_AUTH_URL?.startsWith("https://") ?? true;

  deleteCookie(c, "guest_user_id", {
    path: "/",
    secure,
    sameSite: secure ? "None" : "Lax",
  });

  return c.json({ success: true }, 200);
});
