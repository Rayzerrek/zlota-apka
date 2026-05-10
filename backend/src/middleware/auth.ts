import { factory } from "../lib/factory";
import { resolveUser } from "../lib/guest-session";

export const requireAuth = factory.createMiddleware(async (c, next) => {
  try {
    const { userId } = await resolveUser(c);
    c.set("userId", userId);
    await next();
  } catch {
    return c.json({ error: "Internal server error" }, 500);
  }
});
