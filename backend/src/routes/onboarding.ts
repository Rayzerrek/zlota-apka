import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { user, subjects, userAvailability } from "../db/schema";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { onboardingSchema } from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const onboardingRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Onboarding"],
  request: {
    body: {
      content: { "application/json": { schema: onboardingSchema } },
      required: true,
    },
  },
  responses: { 200: { description: "Onboarding complete" } },
});

export const onboardingRouter = new OpenAPIHono<HonoEnv>();

onboardingRouter.use(requireAuth);

onboardingRouter.openapi(onboardingRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");
  const body = c.req.valid("json");

  await db.transaction(async (tx) => {
    await tx
      .update(user)
      .set({
        name: body.name ?? undefined,
        grade: body.grade,
        onboardingDone: true,
      })
      .where(eq(user.id, userId));

    if (body.subjects.length > 0) {
      await tx
        .insert(subjects)
        .values(body.subjects.map((s) => ({ ...s, userId })))
        .onConflictDoNothing();
    }

    if (body.availability.length > 0) {
      await tx
        .insert(userAvailability)
        .values(body.availability.map((a) => ({ ...a, userId })))
        .onConflictDoNothing();
    }
  });

  return c.json({ ok: true }, 200);
});
