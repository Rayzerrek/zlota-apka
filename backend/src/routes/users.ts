import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import {
  cards,
  exams,
  reviewHistory,
  subjects,
  topics,
  user,
  userAvailability,
  studySessions,
} from "../db/schema";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import {
  okResponseSchema,
  userExportResponseSchema,
  userMeResponseSchema,
  userPatchSchema,
} from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Users"],
  summary: "Pobierz profil zalogowanego użytkownika",
  description:
    "Zwraca dane konta potrzebne do profilu użytkownika razem z dostępnością per dzień.",
  responses: {
    200: {
      description: "Current user profile",
      content: { "application/json": { schema: userMeResponseSchema } },
    },
  },
});

const patchMeRoute = createRoute({
  method: "patch",
  path: "/me",
  tags: ["Users"],
  summary: "Zaktualizuj profil zalogowanego użytkownika",
  description:
    "Aktualizuje podstawowe dane konta użytkownika, np. imię, klasę lub avatar.",
  request: {
    body: {
      content: { "application/json": { schema: userPatchSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Updated current user profile",
      content: {
        "application/json": {
          schema: userMeResponseSchema.omit({ availability: true }),
        },
      },
    },
  },
});

const exportDataRoute = createRoute({
  method: "get",
  path: "/me/export",
  tags: ["Users"],
  summary: "Eksport danych użytkownika",
  description:
    "Zwraca pełny zestaw danych użytkownika do eksportu lub pobrania przez frontend.",
  responses: {
    200: {
      description: "User data export",
      content: { "application/json": { schema: userExportResponseSchema } },
    },
  },
});

const deleteMeRoute = createRoute({
  method: "delete",
  path: "/me",
  tags: ["Users"],
  summary: "Usuń konto zalogowanego użytkownika",
  description:
    "Usuwa konto oraz wszystkie zależne dane przez relacje cascade w bazie.",
  responses: {
    200: {
      description: "Deleted current user account",
      content: { "application/json": { schema: okResponseSchema } },
    },
  },
});

export const usersRouter = new OpenAPIHono<HonoEnv>();

usersRouter.use(requireAuth);

usersRouter.openapi(getMeRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");

  const [me] = await db.select().from(user).where(eq(user.id, userId));
  const availability = await db
    .select()
    .from(userAvailability)
    .where(eq(userAvailability.userId, userId));

  return c.json(
    {
      ...me,
      availability,
    },
    200,
  );
});

usersRouter.openapi(patchMeRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");
  const body = c.req.valid("json");

  const [updated] = await db
    .update(user)
    .set({
      name: body.name,
      grade: body.grade,
      image: body.image,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();

  return c.json(updated, 200);
});

usersRouter.openapi(exportDataRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");

  const [
    me,
    mySubjects,
    myAvailability,
    myExams,
    myTopics,
    mySessions,
    myCards,
    history,
  ] = await Promise.all([
    db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .then((rows) => rows[0]),
    db.select().from(subjects).where(eq(subjects.userId, userId)),
    db
      .select()
      .from(userAvailability)
      .where(eq(userAvailability.userId, userId)),
    db.select().from(exams).where(eq(exams.userId, userId)),
    db.select().from(topics).where(eq(topics.userId, userId)),
    db.select().from(studySessions).where(eq(studySessions.userId, userId)),
    db.select().from(cards).where(eq(cards.userId, userId)),
    db.select().from(reviewHistory).where(eq(reviewHistory.userId, userId)),
  ]);

  return c.json(
    {
      user: me,
      subjects: mySubjects,
      availability: myAvailability,
      exams: myExams,
      topics: myTopics,
      sessions: mySessions,
      cards: myCards,
      reviewHistory: history,
      exportedAt: new Date().toISOString(),
    },
    200,
  );
});

usersRouter.openapi(deleteMeRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");

  await db.delete(user).where(eq(user.id, userId));

  return c.json({ ok: true }, 200);
});
