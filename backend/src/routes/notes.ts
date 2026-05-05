import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { generatedNotes, notifications } from "../db/schema";
import {
  NOTE_PROMPT,
  SCAN_MODEL_NAME,
  errorResponseSchema,
  generateNoteRequestSchema,
  generatedNoteResponseSchema,
} from "../lib/constant";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";

import type { HonoEnv } from "../lib/factory";

const generateNoteRoute = createRoute({
  method: "post",
  path: "/notes",
  tags: ["Notes"],
  request: {
    body: {
      content: { "application/json": { schema: generateNoteRequestSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Generated note",
      content: {
        "application/json": { schema: generatedNoteResponseSchema },
      },
    },
    400: {
      description: "Invalid request",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    502: {
      description: "Upstream AI error",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const getNoteRoute = createRoute({
  method: "get",
  path: "/notes/{id}",
  tags: ["Notes"],
  request: {
    params: z.object({ id: z.string().min(1) }),
  },
  responses: {
    200: {
      description: "Retrieved note",
      content: {
        "application/json": { schema: generatedNoteResponseSchema },
      },
    },
    404: {
      description: "Note not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

export const notesRouter = new OpenAPIHono<HonoEnv>();

notesRouter.use(requireAuth);

notesRouter.openapi(generateNoteRoute, async (c) => {
  const apiKey = c.env.GEMINI_API_KEY;
  if (!apiKey) {
    return c.json({ error: "Missing GEMINI_API_KEY" }, 500);
  }

  const { topic, subject } = c.req.valid("json");
  const subjectLabel = subject ? ` (${subject})` : "";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: SCAN_MODEL_NAME });

    const prompt = [NOTE_PROMPT, "", `Temat: ${topic}${subjectLabel}`].join(
      "\n",
    );

    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    if (!content) {
      return c.json(
        { error: "Model nie zwrócił treści. Spróbuj ponownie." },
        502,
      );
    }

    const title = subject ? `${subject}: ${topic}` : topic;

    const db = createDb(c.env);
    const userId = c.get("userId");

    const [note] = await db
      .insert(generatedNotes)
      .values({
        userId,
        title,
        subject: subject ?? null,
        prompt: topic,
        content,
      })
      .returning();

    await db.insert(notifications).values({
      userId,
      type: "note_generated",
      category: "ai",
      priority: "low",
      title: "Wygenerowano notatkę",
      description: title,
      actionUrl: `/note/${note.id}`,
      sentAt: new Date(),
      scheduledFor: null,
    });

    return c.json(
      {
        id: note.id,
        title: note.title,
        subject: note.subject,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
      },
      200,
    );
  } catch (error: unknown) {
    console.error("AI note error:", error);
    return c.json(
      {
        error:
          error instanceof Error && error.message
            ? error.message
            : "Nie udało się wygenerować notatki",
      },
      502,
    );
  }
});

notesRouter.openapi(getNoteRoute, async (c) => {
  const { id } = c.req.valid("param");
  const db = createDb(c.env);

  const [note] = await db
    .select()
    .from(generatedNotes)
    .where(eq(generatedNotes.id, id))
    .limit(1);

  if (!note) {
    return c.json({ error: "Notatka nie została znaleziona" }, 404);
  }

  return c.json(
    {
      id: note.id,
      title: note.title,
      subject: note.subject,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
    },
    200,
  );
});
