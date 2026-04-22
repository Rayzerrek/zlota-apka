import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";

import { studySessions } from "../db/schema";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";

import type { HonoEnv } from "../lib/factory";

const completeSchema = z.object({
  actualMinutes: z.number().int().min(1),
  evaluationScore: z.number().int().min(1).max(5).optional(),
  completedScope: z.enum(["yes", "no", "partially"]).optional(),
  difficultyNotes: z.string().max(500).optional(),
});

const dateQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

const idParams = z.object({ id: z.string() });

const listSessionsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Sessions"],
  request: { query: dateQuerySchema },
  responses: { 200: { description: "List of sessions" } },
});

const completeSessionRoute = createRoute({
  method: "patch",
  path: "/{id}/complete",
  tags: ["Sessions"],
  request: {
    params: idParams,
    body: {
      content: { "application/json": { schema: completeSchema } },
      required: true,
    },
  },
  responses: {
    200: { description: "Completed session" },
    404: { description: "Not found" },
  },
});

const skipSessionRoute = createRoute({
  method: "patch",
  path: "/{id}/skip",
  tags: ["Sessions"],
  request: { params: idParams },
  responses: {
    200: { description: "Skipped session" },
    404: { description: "Not found" },
  },
});

export const sessionsRouter = new OpenAPIHono<HonoEnv>();

sessionsRouter.use(requireAuth);

sessionsRouter.openapi(listSessionsRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");
  const { date, from, to } = c.req.valid("query");

  const conditions = [eq(studySessions.userId, userId)];

  if (date) {
    conditions.push(eq(studySessions.scheduledDate, date));
  } else {
    if (from) conditions.push(gte(studySessions.scheduledDate, from));
    if (to) conditions.push(lte(studySessions.scheduledDate, to));
  }

  const rows = await db
    .select()
    .from(studySessions)
    .where(and(...conditions));

  return c.json(rows, 200);
});

sessionsRouter.openapi(completeSessionRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");
  const body = c.req.valid("json");

  const [row] = await db
    .update(studySessions)
    .set({
      status: "completed",
      actualMinutes: body.actualMinutes,
      evaluationScore: body.evaluationScore,
      completedScope: body.completedScope,
      difficultyNotes: body.difficultyNotes,
      completedAt: new Date(),
    })
    .where(
      and(
        eq(studySessions.id, c.req.valid("param").id),
        eq(studySessions.userId, userId),
      ),
    )
    .returning();

  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row, 200);
});

sessionsRouter.openapi(skipSessionRoute, async (c) => {
  const db = createDb(c.env);
  const [row] = await db
    .update(studySessions)
    .set({ status: "skipped" })
    .where(
      and(
        eq(studySessions.id, c.req.valid("param").id),
        eq(studySessions.userId, c.get("userId")),
      ),
    )
    .returning();

  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row, 200);
});
