import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";

import {
  exams,
  notifications,
  schedulerRuns,
  studySessions,
  subjects,
  topics,
  userAvailability,
} from "../db/schema";
import { errorResponseSchema } from "../lib/constant";
import { createDb } from "../lib/db";
import { createStudySessions, generateExamPlan } from "../lib/helpers";
import { requireAuth } from "../middleware/auth";
import {
  examCreateResponseSchema,
  examCreateSchema,
  examDetailResponseSchema,
  examListResponseSchema,
  examPatchSchema,
  examRowSchema,
  idParamsSchema,
  okResponseSchema,
  topicCreateSchema,
  topicListResponseSchema,
  topicRowSchema,
} from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const listExamsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Exams"],
  responses: {
    200: {
      description: "List of exams",
      content: { "application/json": { schema: examListResponseSchema } },
    },
  },
});

const createExamRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Exams"],
  request: {
    body: {
      content: { "application/json": { schema: examCreateSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Created exam with topics and sessions",
      content: { "application/json": { schema: examCreateResponseSchema } },
    },
    404: {
      description: "Subject not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const getExamRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Exams"],
  request: { params: idParamsSchema },
  responses: {
    200: {
      description: "Exam detail",
      content: { "application/json": { schema: examDetailResponseSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const patchExamRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Exams"],
  request: {
    params: idParamsSchema,
    body: {
      content: { "application/json": { schema: examPatchSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Updated exam",
      content: { "application/json": { schema: examRowSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const deleteExamRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Exams"],
  request: { params: idParamsSchema },
  responses: {
    200: {
      description: "Deleted",
      content: { "application/json": { schema: okResponseSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const listExamTopicsRoute = createRoute({
  method: "get",
  path: "/{id}/topics",
  tags: ["Topics"],
  request: { params: idParamsSchema },
  responses: {
    200: {
      description: "Topics for exam",
      content: { "application/json": { schema: topicListResponseSchema } },
    },
  },
});

const createExamTopicRoute = createRoute({
  method: "post",
  path: "/{id}/topics",
  tags: ["Topics"],
  request: {
    params: idParamsSchema,
    body: {
      content: { "application/json": { schema: topicCreateSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Created topic",
      content: { "application/json": { schema: topicRowSchema } },
    },
    404: {
      description: "Exam not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

export const examsRouter = new OpenAPIHono<HonoEnv>();

examsRouter.use(requireAuth);

examsRouter.openapi(listExamsRoute, async (c) => {
  const db = createDb(c.env);
  const rows = await db
    .select({
      id: exams.id,
      userId: exams.userId,
      subjectId: exams.subjectId,
      name: exams.name,
      examDate: exams.examDate,
      difficulty: exams.difficulty,
      materialSize: exams.materialSize,
      notes: exams.notes,
      createdAt: exams.createdAt,
      subjectKey: subjects.key,
    })
    .from(exams)
    .leftJoin(subjects, eq(exams.subjectId, subjects.id))
    .where(eq(exams.userId, c.get("userId")));
  return c.json(rows, 200);
});

examsRouter.openapi(createExamRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");
  const body = c.req.valid("json");
  const today = new Date().toISOString().slice(0, 10);

  const [subject] = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(and(eq(subjects.id, body.subjectId), eq(subjects.userId, userId)));
  if (!subject) return c.json({ error: "Subject not found" }, 404);

  const result = await db.transaction(async (tx) => {
    const [exam] = await tx
      .insert(exams)
      .values({
        userId,
        subjectId: body.subjectId,
        name: body.name,
        examDate: body.examDate,
        difficulty: body.difficulty,
        materialSize: body.materialSize,
        notes: body.notes,
      })
      .returning();

    const createdTopics =
      body.topicNames.length > 0
        ? await tx
            .insert(topics)
            .values(
              body.topicNames.map((name, i) => ({
                userId,
                subjectId: body.subjectId,
                examId: exam.id,
                name,
                position: i,
              })),
            )
            .returning()
        : [];

    const availability = await tx
      .select()
      .from(userAvailability)
      .where(eq(userAvailability.userId, userId));

    const { plannedSessions, daysUntilExam, dailyMinutes } = generateExamPlan(
      exam,
      createdTopics,
      availability,
      today,
      body.examDate,
    );

    const [run] = await tx
      .insert(schedulerRuns)
      .values({
        userId,
        examId: exam.id,
        daysUntilExam,
        topicsCount: createdTopics.length,
        dailyMinutes,
        sessionsCreated: plannedSessions.length,
        planJson: plannedSessions,
      })
      .returning();

    const sessionValues = createStudySessions(plannedSessions, {
      userId,
      examId: exam.id,
      schedulerRunId: run.id,
    });

    const createdSessions =
      sessionValues.length > 0
        ? await tx.insert(studySessions).values(sessionValues).returning()
        : [];

    await tx.insert(notifications).values({
      userId,
      type: "exam_created",
      category: "exam",
      priority: "medium",
      title: "Zaplanowano sesje nauki",
      description: `${createdSessions.length} ${createdSessions.length === 1 ? "sesja" : "sesje"} · ${body.name}`,
      actionUrl: "/calendar",
      sentAt: new Date(),
      scheduledFor: null,
    });

    return {
      exam,
      topics: createdTopics,
      sessions: createdSessions,
      schedulerRunId: run.id,
    };
  });

  return c.json(result, 201);
});

examsRouter.openapi(getExamRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");
  const examId = c.req.valid("param").id;

  const [examRows, examTopics, sessions] = await Promise.all([
    db
      .select()
      .from(exams)
      .where(and(eq(exams.id, examId), eq(exams.userId, userId))),
    db
      .select()
      .from(topics)
      .where(and(eq(topics.examId, examId), eq(topics.userId, userId))),
    db
      .select()
      .from(studySessions)
      .where(
        and(eq(studySessions.examId, examId), eq(studySessions.userId, userId)),
      ),
  ]);

  const [exam] = examRows;
  if (!exam) return c.json({ error: "Not found" }, 404);

  return c.json({ exam, topics: examTopics, sessions }, 200);
});

examsRouter.openapi(patchExamRoute, async (c) => {
  const db = createDb(c.env);
  const [row] = await db
    .update(exams)
    .set(c.req.valid("json"))
    .where(
      and(
        eq(exams.id, c.req.valid("param").id),
        eq(exams.userId, c.get("userId")),
      ),
    )
    .returning();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row, 200);
});

examsRouter.openapi(deleteExamRoute, async (c) => {
  const db = createDb(c.env);
  const [row] = await db
    .delete(exams)
    .where(
      and(
        eq(exams.id, c.req.valid("param").id),
        eq(exams.userId, c.get("userId")),
      ),
    )
    .returning();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true }, 200);
});

examsRouter.openapi(listExamTopicsRoute, async (c) => {
  const db = createDb(c.env);
  const rows = await db
    .select()
    .from(topics)
    .where(
      and(
        eq(topics.examId, c.req.valid("param").id),
        eq(topics.userId, c.get("userId")),
      ),
    );
  return c.json(rows, 200);
});

examsRouter.openapi(createExamTopicRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");
  const examId = c.req.valid("param").id;
  const body = c.req.valid("json");

  const [exam] = await db
    .select({ id: exams.id })
    .from(exams)
    .where(and(eq(exams.id, examId), eq(exams.userId, userId)));
  if (!exam) return c.json({ error: "Exam not found" }, 404);

  const [row] = await db
    .insert(topics)
    .values({ ...body, userId, examId })
    .returning();
  return c.json(row, 201);
});
