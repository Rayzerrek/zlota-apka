import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq, lte } from "drizzle-orm";
import { z } from "zod";

import { cards, reviewHistory } from "../db/schema";
import { createDb } from "../lib/db";
import { scheduleReview, type Rating } from "../lib/fsrs";
import { requireAuth } from "../middleware/auth";

import type { HonoEnv } from "../lib/factory";

const createCardSchema = z.object({
  front: z.string().min(1).max(2000),
  back: z.string().min(1).max(2000),
  source: z.enum(["manual", "ai"]).default("manual"),
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(4),
  sessionId: z.string().optional(),
});

const topicIdParams = z.object({ topicId: z.string() });
const cardIdParams = z.object({ id: z.string() });

const dueCardsRoute = createRoute({
  method: "get",
  path: "/due",
  tags: ["Cards"],
  responses: { 200: { description: "Due cards" } },
});

const listCardsRoute = createRoute({
  method: "get",
  path: "/topics/{topicId}/cards",
  tags: ["Cards"],
  request: { params: topicIdParams },
  responses: { 200: { description: "Cards for topic" } },
});

const createCardRoute = createRoute({
  method: "post",
  path: "/topics/{topicId}/cards",
  tags: ["Cards"],
  request: {
    params: topicIdParams,
    body: {
      content: { "application/json": { schema: createCardSchema } },
      required: true,
    },
  },
  responses: { 201: { description: "Created card" } },
});

const deleteCardRoute = createRoute({
  method: "delete",
  path: "/cards/{id}",
  tags: ["Cards"],
  request: { params: cardIdParams },
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
    params: cardIdParams,
    body: {
      content: { "application/json": { schema: reviewSchema } },
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
  const [row] = await db
    .insert(cards)
    .values({
      ...c.req.valid("json"),
      userId: c.get("userId"),
      topicId: c.req.valid("param").topicId,
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
