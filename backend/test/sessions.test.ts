import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { notifications, studySessions, topics } from "../src/db/schema";
import { app, createEnv, resetTestState, setDb } from "./harness";

const completeSessionResponseSchema = z.object({
  status: z.string(),
});

beforeEach(() => {
  resetTestState();
});

describe("session routes", () => {
  it("completes a session and emits a notification", async () => {
    const insertedNotifications: unknown[] = [];

    setDb(({ kind, table, values }) => {
      if (kind === "update" && table === studySessions) {
        return [
          {
            id: "session-1",
            userId: "user-1",
            examId: "exam-1",
            topicId: "topic-1",
            schedulerRunId: "run-1",
            scheduledDate: "2026-05-12",
            plannedMinutes: 30,
            actualMinutes: 25,
            sessionType: "study",
            status: "completed",
            notes: null,
            evaluationScore: 4,
            completedScope: "yes",
            difficultyNotes: null,
            completedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ];
      }
      if (kind === "select" && table === topics) {
        return [{ name: "Algebra" }];
      }
      if (kind === "insert" && table === notifications) {
        insertedNotifications.push(values);
        return [];
      }
      return [];
    });

    const response = await app.request(
      "/api/sessions/session-1/complete",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actualMinutes: 25,
          evaluationScore: 4,
          completedScope: "yes",
        }),
      },
      createEnv(),
    );

    expect(response.status).toBe(200);

    const body = completeSessionResponseSchema.parse(await response.json());
    expect(body.status).toBe("completed");
    expect(insertedNotifications).toHaveLength(1);
    expect(insertedNotifications[0]).toMatchObject({
      type: "session_completed",
      title: "Sesja ukończona",
    });
  });

  it("returns 404 when completing a missing session", async () => {
    const response = await app.request(
      "/api/sessions/missing-session/complete",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualMinutes: 25 }),
      },
      createEnv(),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not found" });
  });
});
