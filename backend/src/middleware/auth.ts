// import { createAuth } from "../lib/auth";
import { factory } from "../lib/factory";

export const requireAuth = factory.createMiddleware(async (c, next) => {
  // Auth disabled temporarily
  // const auth = createAuth(c.env);
  // const session = await auth.api.getSession({ headers: c.req.raw.headers });
  // if (!session) return c.json({ error: "Unauthorized" }, 401);
  // c.set("userId", session.user.id);
  await next();
});
