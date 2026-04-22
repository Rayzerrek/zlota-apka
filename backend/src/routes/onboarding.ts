import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { user, subjects, userAvailability } from "../db/schema";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";

import type { HonoEnv } from "../lib/factory";

const schema = z.object({
  grade: z.string().min(1).max(32),
  subjects: z
    .array(
      z.object({
        key: z.string().min(1).max(64),
        name: z.string().min(1).max(128),
        color: z.string().regex(/^#[0-9a-f]{6}$/i),
        difficulty: z.number().int().min(1).max(5),
      }),
    )
    .min(1),
  availability: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      availableMinutes: z.number().int().min(0).max(720),
    }),
  ),
});

const onboardingRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Onboarding"],
  request: {
    body: { content: { "application/json": { schema } }, required: true },
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
      .set({ grade: body.grade, onboardingDone: true })
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
