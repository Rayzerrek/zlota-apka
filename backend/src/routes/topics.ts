import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";

import { topics } from "../db/schema";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import {
  examIdParamsSchema,
  idParamsSchema,
  topicCreateSchema,
  topicPatchSchema,
} from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const listTopicsRoute = createRoute({
  method: "get",
  path: "/exams/{examId}/topics",
  tags: ["Topics"],
  request: { params: examIdParamsSchema },
  responses: { 200: { description: "Topics for exam" } },
});

const createTopicRoute = createRoute({
  method: "post",
  path: "/exams/{examId}/topics",
  tags: ["Topics"],
  request: {
    params: examIdParamsSchema,
    body: {
      content: { "application/json": { schema: topicCreateSchema } },
      required: true,
    },
  },
  responses: { 201: { description: "Created topic" } },
});

const patchTopicRoute = createRoute({
  method: "patch",
  path: "/topics/{id}",
  tags: ["Topics"],
  request: {
    params: idParamsSchema,
    body: {
      content: { "application/json": { schema: topicPatchSchema } },
      required: true,
    },
  },
  responses: {
    200: { description: "Updated topic" },
    404: { description: "Not found" },
  },
});

const deleteTopicRoute = createRoute({
  method: "delete",
  path: "/topics/{id}",
  tags: ["Topics"],
  request: { params: idParamsSchema },
  responses: {
    200: { description: "Deleted" },
    404: { description: "Not found" },
  },
});

export const topicsRouter = new OpenAPIHono<HonoEnv>();

topicsRouter.use(requireAuth);

topicsRouter.openapi(listTopicsRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const rows = await db
      .select()
      .from(topics)
      .where(
        and(
          eq(topics.examId, c.req.valid("param").examId),
          eq(topics.userId, c.get("userId")),
        ),
      );
    return c.json(rows, 200);
  } catch (err) {
    console.error("GET /exams/:examId/topics failed", err);
    throw err;
  }
});

topicsRouter.openapi(createTopicRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const userId = c.get("userId");
    const examId = c.req.valid("param").examId;
    const body = c.req.valid("json");

    const [row] = await db
      .insert(topics)
      .values({ ...body, userId, examId })
      .returning();
    return c.json(row, 201);
  } catch (err) {
    console.error("POST /exams/:examId/topics failed", err);
    throw err;
  }
});

topicsRouter.openapi(patchTopicRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const [row] = await db
      .update(topics)
      .set(c.req.valid("json"))
      .where(
        and(
          eq(topics.id, c.req.valid("param").id),
          eq(topics.userId, c.get("userId")),
        ),
      )
      .returning();
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json(row, 200);
  } catch (err) {
    console.error("PATCH /topics/:id failed", err);
    throw err;
  }
});

topicsRouter.openapi(deleteTopicRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const [row] = await db
      .delete(topics)
      .where(
        and(
          eq(topics.id, c.req.valid("param").id),
          eq(topics.userId, c.get("userId")),
        ),
      )
      .returning();
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({ ok: true }, 200);
  } catch (err) {
    console.error("DELETE /topics/:id failed", err);
    throw err;
  }
});
