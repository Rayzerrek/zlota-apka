import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { and, eq, lte } from "drizzle-orm";

import { cards, reviewHistory, subjects, topics } from "../db/schema";
import { errorResponseSchema } from "../lib/constant";
import { createDb } from "../lib/db";
import { type Rating, scheduleReview } from "../lib/fsrs";
import { requireAuth } from "../middleware/auth";
import {
  cardAllListResponseSchema,
  cardCreateSchema,
  cardListResponseSchema,
  cardReviewSchema,
  cardRowSchema,
  idParamsSchema,
  okResponseSchema,
  reviewHistoryListResponseSchema,
  topicIdParamsSchema,
} from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const allCardsRoute = createRoute({
  method: "get",
  path: "/cards",
  tags: ["Cards"],
  responses: {
    200: {
      description: "All user cards with topic and subject",
      content: { "application/json": { schema: cardAllListResponseSchema } },
    },
  },
});

const dueCardsRoute = createRoute({
  method: "get",
  path: "/cards/due",
  tags: ["Cards"],
  responses: {
    200: {
      description: "Due cards",
      content: { "application/json": { schema: cardListResponseSchema } },
    },
  },
});

const listCardsRoute = createRoute({
  method: "get",
  path: "/topics/{topicId}/cards",
  tags: ["Cards"],
  request: { params: topicIdParamsSchema },
  responses: {
    200: {
      description: "Cards for topic",
      content: { "application/json": { schema: cardListResponseSchema } },
    },
  },
});

const createCardRoute = createRoute({
  method: "post",
  path: "/topics/{topicId}/cards",
  tags: ["Cards"],
  request: {
    params: topicIdParamsSchema,
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

const deleteCardRoute = createRoute({
  method: "delete",
  path: "/cards/{id}",
  tags: ["Cards"],
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

const reviewCardRoute = createRoute({
  method: "post",
  path: "/cards/{id}/review",
  tags: ["Cards"],
  request: {
    params: idParamsSchema,
    body: {
      content: { "application/json": { schema: cardReviewSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Updated card after review",
      content: { "application/json": { schema: cardRowSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const reviewHistoryRoute = createRoute({
  method: "get",
  path: "/review-history",
  tags: ["Cards"],
  responses: {
    200: {
      description: "User review history",
      content: {
        "application/json": { schema: reviewHistoryListResponseSchema },
      },
    },
  },
});

export const cardsRouter = new OpenAPIHono<HonoEnv>();

cardsRouter.use(requireAuth);

cardsRouter.openapi(allCardsRoute, async (c) => {
  const db = createDb(c.env);
  const rows = await db
    .select({
      id: cards.id,
      topicId: cards.topicId,
      front: cards.front,
      back: cards.back,
      source: cards.source,
      stability: cards.stability,
      difficulty: cards.difficulty,
      elapsedDays: cards.elapsedDays,
      scheduledDays: cards.scheduledDays,
      reps: cards.reps,
      lapses: cards.lapses,
      state: cards.state,
      lastReview: cards.lastReview,
      due: cards.due,
      createdAt: cards.createdAt,
      updatedAt: cards.updatedAt,
      topicName: topics.name,
      subjectKey: subjects.key,
    })
    .from(cards)
    .leftJoin(topics, eq(cards.topicId, topics.id))
    .leftJoin(subjects, eq(topics.subjectId, subjects.id))
    .where(eq(cards.userId, c.get("userId")));
  return c.json(rows, 200);
});

cardsRouter.openapi(dueCardsRoute, async (c) => {
  const db = createDb(c.env);
  const now = new Date();
  const rows = await db
    .select()
    .from(cards)
    .where(and(eq(cards.userId, c.get("userId")), lte(cards.due, now)))
    .limit(50);
  return c.json(rows, 200);
});

cardsRouter.openapi(listCardsRoute, async (c) => {
  const db = createDb(c.env);
  const rows = await db
    .select()
    .from(cards)
    .where(
      and(
        eq(cards.topicId, c.req.valid("param").topicId),
        eq(cards.userId, c.get("userId")),
      ),
    );
  return c.json(rows, 200);
});

cardsRouter.openapi(createCardRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");
  const topicId = c.req.valid("param").topicId;

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

cardsRouter.openapi(deleteCardRoute, async (c) => {
  const db = createDb(c.env);
  const [row] = await db
    .delete(cards)
    .where(
      and(
        eq(cards.id, c.req.valid("param").id),
        eq(cards.userId, c.get("userId")),
      ),
    )
    .returning();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true }, 200);
});

cardsRouter.openapi(reviewCardRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");
  const body = c.req.valid("json");
  const now = new Date();

  const [card] = await db
    .select()
    .from(cards)
    .where(
      and(eq(cards.id, c.req.valid("param").id), eq(cards.userId, userId)),
    );

  if (!card) return c.json({ error: "Not found" }, 404);

  const next = scheduleReview(card, body.rating as Rating, now);

  const [updated] = await db
    .update(cards)
    .set({
      stability: next.stability,
      difficulty: next.difficulty,
      elapsedDays: next.elapsedDays,
      scheduledDays: next.scheduledDays,
      reps: next.reps,
      lapses: next.lapses,
      state: next.state,
      lastReview: next.lastReview,
      due: next.due,
      updatedAt: now,
    })
    .where(eq(cards.id, card.id))
    .returning();

  await db.insert(reviewHistory).values({
    userId,
    cardId: card.id,
    sessionId: body.sessionId,
    rating: body.rating,
    stateBefore: card.state,
    stabilityBefore: card.stability,
    difficultyBefore: card.difficulty,
    scheduledDays: next.scheduledDays,
    elapsedDays: next.elapsedDays,
  });

  return c.json(updated, 200);
});

cardsRouter.openapi(reviewHistoryRoute, async (c) => {
  const db = createDb(c.env);
  const rows = await db
    .select({
      id: reviewHistory.id,
      cardId: reviewHistory.cardId,
      sessionId: reviewHistory.sessionId,
      rating: reviewHistory.rating,
      stateBefore: reviewHistory.stateBefore,
      stabilityBefore: reviewHistory.stabilityBefore,
      difficultyBefore: reviewHistory.difficultyBefore,
      scheduledDays: reviewHistory.scheduledDays,
      elapsedDays: reviewHistory.elapsedDays,
      reviewedAt: reviewHistory.reviewedAt,
    })
    .from(reviewHistory)
    .where(eq(reviewHistory.userId, c.get("userId")))
    .orderBy(reviewHistory.reviewedAt);
  return c.json(rows, 200);
});
