import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import { resolveUser } from "../lib/guest-session";
import { guestSessionResponseSchema } from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const guestBootstrapRoute = createRoute({
  method: "post",
  path: "/guest",
  tags: ["Auth"],
  responses: {
    200: {
      description: "Ensure a guest or authenticated session exists",
      content: {
        "application/json": { schema: guestSessionResponseSchema },
      },
    },
  },
});

export const authRouter = new OpenAPIHono<HonoEnv>();

authRouter.openapi(guestBootstrapRoute, async (c) => {
  const session = await resolveUser(c);
  return c.json(session, 200);
});
