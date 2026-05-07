import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";

import { user } from "../db/schema";
import { createAuth } from "../lib/auth";
import { createDb } from "../lib/db";
import { factory } from "../lib/factory";

export const requireAuth = factory.createMiddleware(async (c, next) => {
  const db = createDb(c.env);

  const guestId = getCookie(c, "guest_user_id");
  if (guestId) {
    const existing = await db
      .select()
      .from(user)
      .where(eq(user.id, guestId))
      .limit(1);

    if (existing.length > 0) {
      c.set("userId", guestId);
      await next();
      return;
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

  const newGuestId = crypto.randomUUID();
  const now = new Date();

  try {
    await db.insert(user).values({
      id: newGuestId,
      name: "Gość",
      email: `guest-${newGuestId}@local`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    console.error("[auth] failed to create guest user:", err);
    return c.json({ error: "Internal server error" }, 500);
  }

  setCookie(c, "guest_user_id", newGuestId, {
    httpOnly: true,
    secure: c.env.BETTER_AUTH_URL?.startsWith("https://") ?? false,
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 365, // 1 rok
    path: "/",
  });

  c.set("userId", newGuestId);
  await next();
});
