import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { and, eq, gte, lte } from "drizzle-orm";

import { notifications, studySessions, subjects, topics } from "../db/schema";
import { errorResponseSchema } from "../lib/constant";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import {
  idParamsSchema,
  sessionCompleteSchema,
  sessionDateQuerySchema,
  sessionListResponseSchema,
  sessionRowSchema,
  sessionWithJoinSchema,
} from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const listSessionsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Sessions"],
  request: { query: sessionDateQuerySchema },
  responses: {
    200: {
      description: "List of sessions",
      content: { "application/json": { schema: sessionListResponseSchema } },
    },
  },
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
    200: {
      description: "Completed session",
      content: { "application/json": { schema: sessionRowSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const skipSessionRoute = createRoute({
  method: "patch",
  path: "/{id}/skip",
  tags: ["Sessions"],
  request: { params: idParamsSchema },
  responses: {
    200: {
      description: "Skipped session",
      content: { "application/json": { schema: sessionRowSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const getSessionRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Sessions"],
  request: { params: idParamsSchema },
  responses: {
    200: {
      description: "Session detail",
      content: { "application/json": { schema: sessionWithJoinSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
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
    .select({
      id: studySessions.id,
      userId: studySessions.userId,
      examId: studySessions.examId,
      topicId: studySessions.topicId,
      schedulerRunId: studySessions.schedulerRunId,
      scheduledDate: studySessions.scheduledDate,
      plannedMinutes: studySessions.plannedMinutes,
      actualMinutes: studySessions.actualMinutes,
      sessionType: studySessions.sessionType,
      status: studySessions.status,
      notes: studySessions.notes,
      evaluationScore: studySessions.evaluationScore,
      completedScope: studySessions.completedScope,
      difficultyNotes: studySessions.difficultyNotes,
      completedAt: studySessions.completedAt,
      createdAt: studySessions.createdAt,
      topicName: topics.name,
      subjectKey: subjects.key,
    })
    .from(studySessions)
    .leftJoin(topics, eq(studySessions.topicId, topics.id))
    .leftJoin(subjects, eq(topics.subjectId, subjects.id))
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

  let topicName: string | null = null;
  if (row.topicId) {
    const [topic] = await db
      .select({ name: topics.name })
      .from(topics)
      .where(eq(topics.id, row.topicId));
    topicName = topic?.name ?? null;
  }

  await db.insert(notifications).values({
    userId,
    type: "session_completed",
    category: "session",
    priority: "low",
    title: "Sesja ukończona",
    description: `${topicName ?? "Bez nazwy tematu"} · ${body.actualMinutes} min`,
    actionUrl: "/today",
    sentAt: new Date(),
    scheduledFor: null,
  });

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

sessionsRouter.openapi(getSessionRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");
  const sessionId = c.req.valid("param").id;

  const [row] = await db
    .select({
      id: studySessions.id,
      userId: studySessions.userId,
      examId: studySessions.examId,
      topicId: studySessions.topicId,
      schedulerRunId: studySessions.schedulerRunId,
      scheduledDate: studySessions.scheduledDate,
      plannedMinutes: studySessions.plannedMinutes,
      actualMinutes: studySessions.actualMinutes,
      sessionType: studySessions.sessionType,
      status: studySessions.status,
      notes: studySessions.notes,
      evaluationScore: studySessions.evaluationScore,
      completedScope: studySessions.completedScope,
      difficultyNotes: studySessions.difficultyNotes,
      completedAt: studySessions.completedAt,
      createdAt: studySessions.createdAt,
      topicName: topics.name,
      subjectKey: subjects.key,
    })
    .from(studySessions)
    .leftJoin(topics, eq(studySessions.topicId, topics.id))
    .leftJoin(subjects, eq(topics.subjectId, subjects.id))
    .where(
      and(eq(studySessions.id, sessionId), eq(studySessions.userId, userId)),
    );

  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row, 200);
});
