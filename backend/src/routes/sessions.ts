import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { and, eq, gte, lte } from "drizzle-orm";

import { studySessions } from "../db/schema";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import {
  idParamsSchema,
  sessionCompleteSchema,
  sessionDateQuerySchema,
} from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const listSessionsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Sessions"],
  request: { query: sessionDateQuerySchema },
  responses: { 200: { description: "List of sessions" } },
});

const completeSessionRoute = createRoute({
  method: "patch",
  path: "/{id}/complete",
  tags: ["Sessions"],
  request: {
    params: idParamsSchema,
    body: {
      content: { "application/json": { schema: sessionCompleteSchema } },
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
  request: { params: idParamsSchema },
  responses: {
    200: { description: "Skipped session" },
    404: { description: "Not found" },
  },
});

export const sessionsRouter = new OpenAPIHono<HonoEnv>();

sessionsRouter.use(requireAuth);

sessionsRouter.openapi(listSessionsRoute, async (c) => {
  try {
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
  } catch (err) {
    console.error("GET /sessions failed", err);
    throw err;
  }
});

sessionsRouter.openapi(completeSessionRoute, async (c) => {
  try {
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
  } catch (err) {
    console.error("PATCH /sessions/:id/complete failed", err);
    throw err;
  }
});

sessionsRouter.openapi(skipSessionRoute, async (c) => {
  try {
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
  } catch (err) {
    console.error("PATCH /sessions/:id/skip failed", err);
    throw err;
  }
});
