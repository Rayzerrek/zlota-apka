import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { notifications } from "../src/db/schema";
import { SCAN_MAX_BASE64_BYTES } from "../src/lib/constant";
import {
  app,
  createEnv,
  generateContentMock,
  resetTestState,
  setDb,
} from "./harness";

const scanResponseSchema = z.object({
  text: z.string(),
});

beforeEach(() => {
  resetTestState();
});

describe("scan routes", () => {
  it("rejects oversized OCR payloads before calling Gemini", async () => {
    const oversizedBase64 = Buffer.alloc(SCAN_MAX_BASE64_BYTES + 1).toString(
      "base64",
    );

    const response = await app.request(
      "/api/scan",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: [{ data: oversizedBase64, mimeType: "image/jpeg" }],
        }),
      },
      createEnv({ GEMINI_API_KEY: "gemini-key" }),
    );

    expect(response.status).toBe(400);
    expect(generateContentMock).not.toHaveBeenCalled();
  });

  it("scans images and stores a notification on success", async () => {
    const insertedNotifications: unknown[] = [];

    generateContentMock.mockResolvedValue({
      response: {
        text: () => "# Notatka\n\nTreść",
      },
    });

    setDb(({ kind, table, values }) => {
      if (kind === "insert" && table === notifications) {
        insertedNotifications.push(values);
      }
      return [];
    });

    const response = await app.request(
      "/api/scan",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: [{ data: Buffer.from("small-image").toString("base64") }],
        }),
      },
      createEnv({ GEMINI_API_KEY: "gemini-key" }),
    );

    expect(response.status).toBe(200);
    expect(scanResponseSchema.parse(await response.json())).toEqual({
      text: "# Notatka\n\nTreść",
    });
    expect(generateContentMock).toHaveBeenCalledTimes(1);
    expect(insertedNotifications).toHaveLength(1);
  });
});
