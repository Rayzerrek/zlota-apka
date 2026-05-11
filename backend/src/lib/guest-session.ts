import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";

import { user } from "../db/schema";
import { createAuth } from "./auth";
import { createDb } from "./db";

import type { HonoEnv } from "./factory";
import type { Context } from "hono";
import type { CookieOptions } from "hono/utils/cookie";

const GUEST_COOKIE_NAME = "guest_user_id";

function guestCookieOptions(env: { BETTER_AUTH_URL?: string }): CookieOptions {
  return {
    httpOnly: true,
    secure: env.BETTER_AUTH_URL?.startsWith("https://") ?? false,
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  };
}

async function findGuestUserId(
  c: Context<HonoEnv>,
  guestId: string,
): Promise<string | null> {
  const db = createDb(c.env);

  try {
    const guestUser = await db
      .select({ id: user.id, isGuest: user.isGuest })
      .from(user)
      .where(eq(user.id, guestId))
      .limit(1);

    if (guestUser.length > 0 && guestUser[0].isGuest) {
      return guestUser[0].id;
    }
  } catch (err) {
    console.warn("[auth] failed to look up guest user:", err);
  }

  return null;
}

async function createGuestUser(c: Context<HonoEnv>): Promise<string> {
  const db = createDb(c.env);
  const newGuestId = crypto.randomUUID();
  const now = new Date();

  await db.insert(user).values({
    id: newGuestId,
    name: "Gość",
    email: `guest-${newGuestId}@local`,
    emailVerified: true,
    isGuest: true,
    createdAt: now,
    updatedAt: now,
  });

  return newGuestId;
}

function persistGuestCookie(c: Context<HonoEnv>, guestId: string) {
  setCookie(c, GUEST_COOKIE_NAME, guestId, guestCookieOptions(c.env));
}

export type ResolvedUser = {
  userId: string;
  isGuest: boolean;
};

export async function resolveUser(c: Context<HonoEnv>): Promise<ResolvedUser> {
  const guestId = getCookie(c, GUEST_COOKIE_NAME);
  if (guestId) {
    const existingGuestId = await findGuestUserId(c, guestId);
    if (existingGuestId) {
      return { userId: existingGuestId, isGuest: true };
    }
  }

  try {
    const auth = createAuth(c.env);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (session) {
      return { userId: session.user.id, isGuest: false };
    }
  } catch (err) {
    console.warn("[auth] getSession failed, falling back to guest:", err);
  }

  const demoGuestId = c.env.DEMO_GUEST_ID?.trim();
  if (demoGuestId) {
    const existingGuestId = await findGuestUserId(c, demoGuestId);
    if (existingGuestId) {
      persistGuestCookie(c, existingGuestId);
      return { userId: existingGuestId, isGuest: true };
    }
  }

  try {
    const newGuestId = await createGuestUser(c);
    persistGuestCookie(c, newGuestId);
    return { userId: newGuestId, isGuest: true };
  } catch (err) {
    console.error("[auth] failed to create guest user:", err);
    throw err;
  }
}
