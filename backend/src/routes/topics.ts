import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { topics } from "../db/schema";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";

import type { HonoEnv } from "../lib/factory";

const createSchema = z.object({
  name: z.string().min(1).max(256),
  subjectId: z.string().min(1),
  position: z.number().int().min(0).default(0),
});

const patchSchema = z.object({
  name: z.string().min(1).max(256).optional(),
  position: z.number().int().min(0).optional(),
});

const examIdParams = z.object({ examId: z.string() });
const idParams = z.object({ id: z.string() });

const listTopicsRoute = createRoute({
  method: "get",
  path: "/exams/{examId}/topics",
  tags: ["Topics"],
  request: { params: examIdParams },
  responses: { 200: { description: "Topics for exam" } },
});

const createTopicRoute = createRoute({
  method: "post",
  path: "/exams/{examId}/topics",
  tags: ["Topics"],
  request: {
    params: examIdParams,
    body: {
      content: { "application/json": { schema: createSchema } },
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
    params: idParams,
    body: {
      content: { "application/json": { schema: patchSchema } },
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
  request: { params: idParams },
  responses: {
    200: { description: "Deleted" },
    404: { description: "Not found" },
  },
});

export const topicsRouter = new OpenAPIHono<HonoEnv>();

topicsRouter.use(requireAuth);

topicsRouter.openapi(listTopicsRoute, async (c) => {
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
});

topicsRouter.openapi(createTopicRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");
  const examId = c.req.valid("param").examId;
  const body = c.req.valid("json");

  const [row] = await db
    .insert(topics)
    .values({ ...body, userId, examId })
    .returning();
  return c.json(row, 201);
});

topicsRouter.openapi(patchTopicRoute, async (c) => {
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
});

topicsRouter.openapi(deleteTopicRoute, async (c) => {
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
});
