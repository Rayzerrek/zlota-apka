import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import { notifications } from "../db/schema";
import {
  SCAN_MIME_FALLBACK,
  SCAN_MIME_JPG,
  SCAN_MODEL_NAME,
  SCAN_PROMPT,
  SCAN_ROUTE_TAGS,
  type ScanImage,
  errorResponseSchema,
  scanRequestSchema,
  scanResponseSchema,
} from "../lib/constant";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";

import type { HonoEnv } from "../lib/factory";

const scanRoute = createRoute({
  method: "post",
  path: "/",
  tags: SCAN_ROUTE_TAGS,
  request: {
    body: {
      content: { "application/json": { schema: scanRequestSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Generated note",
      content: { "application/json": { schema: scanResponseSchema } },
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

const scanRouter = new OpenAPIHono<HonoEnv>();

scanRouter.use(requireAuth);

function normalizeMimeType(mimeType: string): string {
  const normalized = mimeType.split(";")[0].trim().toLowerCase();
  if (normalized === SCAN_MIME_JPG) return SCAN_MIME_FALLBACK;
  return normalized || SCAN_MIME_FALLBACK;
}

function normalizeBase64(data: string): string {
  const commaIndex = data.indexOf(",");
  return commaIndex >= 0 ? data.slice(commaIndex + 1) : data;
}

function createImageParts(images: ScanImage[]) {
  return images.map((image) => ({
    inlineData: {
      data: normalizeBase64(image.data),
      mimeType: normalizeMimeType(image.mimeType),
    },
  }));
}

scanRouter.openapi(scanRoute, async (c) => {
  const currentKey = c.env.GEMINI_API_KEY;

  if (!currentKey) {
    return c.json({ error: "Missing GEMINI_API_KEY" }, 500);
  }

  const { images } = c.req.valid("json");
  const genAI = new GoogleGenerativeAI(currentKey);
  const model = genAI.getGenerativeModel({ model: SCAN_MODEL_NAME });

  try {
    const result = await model.generateContent([
      SCAN_PROMPT,
      ...createImageParts(images),
    ]);

    const text = result.response.text().trim();

    if (!text) {
      return c.json(
        { error: "The model returned no content. Please try again." },
        502,
      );
    }

    const db = createDb(c.env);
    const userId = c.get("userId");

    await db.insert(notifications).values({
      userId,
      type: "scan_completed",
      category: "ai",
      priority: "low",
      title: "Przeskanowano dokument",
      description: text.length > 80 ? `${text.slice(0, 80)}…` : text,
      sentAt: new Date(),
      scheduledFor: null,
    });

    return c.json({ text }, 200);
  } catch (error: unknown) {
    console.error("AI error:", error);
    return c.json(
      {
        error:
          error instanceof Error && error.message
            ? error.message
            : "Failed to generate the note",
      },
      502,
    );
  }
});

export default scanRouter;
