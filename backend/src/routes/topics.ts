import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";

import { cards, exams, subjects, topics } from "../db/schema";
import { errorResponseSchema } from "../lib/constant";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import {
  cardCreateSchema,
  cardListResponseSchema,
  cardRowSchema,
  idParamsSchema,
  okResponseSchema,
  topicPatchSchema,
  topicRowSchema,
  topicWithSubjectListResponseSchema,
} from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const allTopicsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Topics"],
  responses: {
    200: {
      description: "All user topics with subject",
      content: {
        "application/json": { schema: topicWithSubjectListResponseSchema },
      },
    },
  },
});

const listTopicCardsRoute = createRoute({
  method: "get",
  path: "/{id}/cards",
  tags: ["Cards"],
  request: { params: idParamsSchema },
  responses: {
    200: {
      description: "Cards for topic",
      content: { "application/json": { schema: cardListResponseSchema } },
    },
  },
});

const createTopicCardRoute = createRoute({
  method: "post",
  path: "/{id}/cards",
  tags: ["Cards"],
  request: {
    params: idParamsSchema,
    body: {
      content: { "application/json": { schema: cardCreateSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Created card",
      content: { "application/json": { schema: cardRowSchema } },
    },
    404: {
      description: "Topic not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const patchTopicRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Topics"],
  request: {
    params: idParamsSchema,
    body: {
      content: { "application/json": { schema: topicPatchSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Updated topic",
      content: { "application/json": { schema: topicRowSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const deleteTopicRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Topics"],
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

export const topicsRouter = new OpenAPIHono<HonoEnv>();

topicsRouter.use(requireAuth);

topicsRouter.openapi(allTopicsRoute, async (c) => {
  const db = createDb(c.env);
  const rows = await db
    .select({
      id: topics.id,
      userId: topics.userId,
      subjectId: topics.subjectId,
      examId: topics.examId,
      name: topics.name,
      position: topics.position,
      createdAt: topics.createdAt,
      subjectName: subjects.name,
      examName: exams.name,
    })
    .from(topics)
    .leftJoin(subjects, eq(topics.subjectId, subjects.id))
    .leftJoin(exams, eq(topics.examId, exams.id))
    .where(eq(topics.userId, c.get("userId")));
  return c.json(rows, 200);
});

topicsRouter.openapi(listTopicCardsRoute, async (c) => {
  const db = createDb(c.env);
  const rows = await db
    .select()
    .from(cards)
    .where(
      and(
        eq(cards.topicId, c.req.valid("param").id),
        eq(cards.userId, c.get("userId")),
      ),
    );
  return c.json(rows, 200);
});

topicsRouter.openapi(createTopicCardRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");
  const topicId = c.req.valid("param").id;

  const [topic] = await db
    .select({ id: topics.id })
    .from(topics)
    .where(and(eq(topics.id, topicId), eq(topics.userId, userId)));
  if (!topic) return c.json({ error: "Topic not found" }, 404);

  const [row] = await db
    .insert(cards)
    .values({
      ...c.req.valid("json"),
      userId,
      topicId,
    })
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
