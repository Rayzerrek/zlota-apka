import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { and, eq, lte } from "drizzle-orm";

import { cards, reviewHistory, topics } from "../db/schema";
import { createDb } from "../lib/db";
import { type Rating, scheduleReview } from "../lib/fsrs";
import { requireAuth } from "../middleware/auth";
import {
  cardCreateSchema,
  cardReviewSchema,
  idParamsSchema,
  topicIdParamsSchema,
} from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const dueCardsRoute = createRoute({
  method: "get",
  path: "/cards/due",
  tags: ["Cards"],
  responses: { 200: { description: "Due cards" } },
});

const listCardsRoute = createRoute({
  method: "get",
  path: "/topics/{topicId}/cards",
  tags: ["Cards"],
  request: { params: topicIdParamsSchema },
  responses: { 200: { description: "Cards for topic" } },
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
  responses: { 201: { description: "Created card" } },
});

const deleteCardRoute = createRoute({
  method: "delete",
  path: "/cards/{id}",
  tags: ["Cards"],
  request: { params: idParamsSchema },
  responses: {
    200: { description: "Deleted" },
    404: { description: "Not found" },
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
    200: { description: "Updated card after review" },
    404: { description: "Not found" },
  },
});

export const cardsRouter = new OpenAPIHono<HonoEnv>();

cardsRouter.use(requireAuth);

cardsRouter.openapi(dueCardsRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const now = new Date();
    const rows = await db
      .select()
      .from(cards)
      .where(and(eq(cards.userId, c.get("userId")), lte(cards.due, now)))
      .limit(50);
    return c.json(rows, 200);
  } catch (err) {
    console.error("GET /cards/due failed", err);
    throw err;
  }
});

cardsRouter.openapi(listCardsRoute, async (c) => {
  try {
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
  } catch (err) {
    console.error("GET /topics/:topicId/cards failed", err);
    throw err;
  }
});

cardsRouter.openapi(createCardRoute, async (c) => {
  try {
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
  } catch (err) {
    console.error("POST /topics/:topicId/cards failed", err);
    throw err;
  }
});

cardsRouter.openapi(deleteCardRoute, async (c) => {
  try {
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
  } catch (err) {
    console.error("DELETE /cards/:id failed", err);
    throw err;
  }
});

cardsRouter.openapi(reviewCardRoute, async (c) => {
  try {
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
  } catch (err) {
    console.error("POST /cards/:id/review failed", err);
    throw err;
  }
});
