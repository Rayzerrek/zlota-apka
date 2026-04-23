import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";

import {
  exams,
  topics,
  studySessions,
  schedulerRuns,
  userAvailability,
} from "../db/schema";
import { createDb } from "../lib/db";
import { generatePlan } from "../lib/scheduler";
import { requireAuth } from "../middleware/auth";
import {
  examCreateSchema,
  examPatchSchema,
  idParamsSchema,
} from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const listExamsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Exams"],
  responses: { 200: { description: "List of exams" } },
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
  responses: { 201: { description: "Created exam with topics and sessions" } },
});

const getExamRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Exams"],
  request: { params: idParamsSchema },
  responses: {
    200: { description: "Exam detail" },
    404: { description: "Not found" },
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
    200: { description: "Updated exam" },
    404: { description: "Not found" },
  },
});

const deleteExamRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Exams"],
  request: { params: idParamsSchema },
  responses: {
    200: { description: "Deleted" },
    404: { description: "Not found" },
  },
});

export const examsRouter = new OpenAPIHono<HonoEnv>();

examsRouter.use(requireAuth);

examsRouter.openapi(listExamsRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const rows = await db
      .select()
      .from(exams)
      .where(eq(exams.userId, c.get("userId")));
    return c.json(rows, 200);
  } catch (err) {
    console.error("GET /exams failed", err);
    throw err;
  }
});

examsRouter.openapi(createExamRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const userId = c.get("userId");
    const body = c.req.valid("json");
    const today = new Date().toISOString().slice(0, 10);

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

      const plannedSessions = generatePlan(
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
          daysUntilExam: Math.max(
            0,
            Math.floor(
              (new Date(body.examDate).getTime() - new Date(today).getTime()) /
                86_400_000,
            ),
          ),
          topicsCount: createdTopics.length,
          dailyMinutes: availability.reduce(
            (sum, a) => sum + a.availableMinutes,
            0,
          ),
          sessionsCreated: plannedSessions.length,
          planJson: plannedSessions,
        })
        .returning();

      const createdSessions =
        plannedSessions.length > 0
          ? await tx
              .insert(studySessions)
              .values(
                plannedSessions.map((s) => ({
                  ...s,
                  userId,
                  examId: exam.id,
                  schedulerRunId: run.id,
                })),
              )
              .returning()
          : [];

      return {
        exam,
        topics: createdTopics,
        sessions: createdSessions,
        schedulerRunId: run.id,
      };
    });

    return c.json(result, 201);
  } catch (err) {
    console.error("POST /exams failed", err);
    throw err;
  }
});

examsRouter.openapi(getExamRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const userId = c.get("userId");
    const examId = c.req.valid("param").id;

    const [exam] = await db
      .select()
      .from(exams)
      .where(and(eq(exams.id, examId), eq(exams.userId, userId)));
    if (!exam) return c.json({ error: "Not found" }, 404);

    const examTopics = await db
      .select()
      .from(topics)
      .where(and(eq(topics.examId, examId), eq(topics.userId, userId)));

    const sessions = await db
      .select()
      .from(studySessions)
      .where(
        and(eq(studySessions.examId, examId), eq(studySessions.userId, userId)),
      );

    return c.json({ exam, topics: examTopics, sessions }, 200);
  } catch (err) {
    console.error("GET /exams/:id failed", err);
    throw err;
  }
});

examsRouter.openapi(patchExamRoute, async (c) => {
  try {
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
  } catch (err) {
    console.error("PATCH /exams/:id failed", err);
    throw err;
  }
});

examsRouter.openapi(deleteExamRoute, async (c) => {
  try {
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
  } catch (err) {
    console.error("DELETE /exams/:id failed", err);
    throw err;
  }
});
