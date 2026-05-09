import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";

import { user } from "../db/schema";
import { createAuth } from "../lib/auth";
import { createDb } from "../lib/db";
import { factory } from "../lib/factory";

import type { CookieOptions } from "hono/utils/cookie";

const guestCookieOptions = (env: {
  BETTER_AUTH_URL?: string;
}): CookieOptions => ({
  httpOnly: true,
  secure: env.BETTER_AUTH_URL?.startsWith("https://") ?? false,
  sameSite: "Lax",
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
});

export const requireAuth = factory.createMiddleware(async (c, next) => {
  const db = createDb(c.env);

  const guestId = getCookie(c, "guest_user_id");
  if (guestId) {
    try {
      const guestUser = await db
        .select({ id: user.id, isGuest: user.isGuest })
        .from(user)
        .where(eq(user.id, guestId))
        .limit(1);
      if (guestUser.length > 0 && guestUser[0].isGuest) {
        c.set("userId", guestUser[0].id);
        await next();
        return;
      }
    } catch (err) {
      console.warn("[auth] failed to look up guest user:", err);
    }
  }

  try {
    const auth = createAuth(c.env);
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (session) {
      c.set("userId", session.user.id);
      await next();
      return;
    }
  } catch (err) {
    console.warn("[auth] getSession failed, falling back to guest:", err);
  }

  const demoGuestId = c.env.DEMO_GUEST_ID?.trim();
  if (demoGuestId) {
    try {
      const demoGuest = await db
        .select({ id: user.id, isGuest: user.isGuest })
        .from(user)
        .where(eq(user.id, demoGuestId))
        .limit(1);
      if (demoGuest.length > 0 && demoGuest[0].isGuest) {
        setCookie(c, "guest_user_id", demoGuestId, guestCookieOptions(c.env));
        c.set("userId", demoGuestId);
        await next();
        return;
      }
    } catch (err) {
      console.error("[auth] failed to look up demo guest:", err);
    }
  }

  const newGuestId = crypto.randomUUID();
  const now = new Date();

  try {
    await db.insert(user).values({
      id: newGuestId,
      name: "Gość",
      email: `guest-${newGuestId}@local`,
      emailVerified: true,
      isGuest: true,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    console.error("[auth] failed to create guest user:", err);
    return c.json({ error: "Internal server error" }, 500);
  }

  setCookie(c, "guest_user_id", newGuestId, guestCookieOptions(c.env));

  c.set("userId", newGuestId);
  await next();
});
