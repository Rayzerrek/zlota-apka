import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import {
  exams,
  notifications,
  schedulerRuns,
  studySessions,
  subjects,
  topics,
  userAvailability,
} from "../src/db/schema";
import { app, createEnv, resetTestState, setDb } from "./harness";

const createExamResponseSchema = z.object({
  schedulerRunId: z.string(),
  topics: z.array(z.unknown()),
  sessions: z.array(z.unknown()),
});

beforeEach(() => {
  resetTestState();
});

describe("exam routes", () => {
  it("creates an exam with planned topics and sessions", async () => {
    const insertedNotifications: unknown[] = [];

    setDb(({ kind, table, values }) => {
      if (kind === "select" && table === subjects) {
        return [{ id: "subject-1" }];
      }
      if (kind === "select" && table === userAvailability) {
        return [{ dayOfWeek: 1, availableMinutes: 90 }];
      }
      if (kind === "insert" && table === exams) {
        return [
          {
            id: "exam-1",
            userId: "user-1",
            subjectId: "subject-1",
            name: "Kartkówka",
            examDate: "2026-05-20",
            difficulty: 3,
            materialSize: "medium",
            notes: null,
            createdAt: new Date().toISOString(),
          },
        ];
      }
      if (kind === "insert" && table === topics) {
        return [
          {
            id: "topic-1",
            userId: "user-1",
            subjectId: "subject-1",
            examId: "exam-1",
            name: "Algebra",
            position: 0,
            createdAt: new Date().toISOString(),
          },
        ];
      }
      if (kind === "insert" && table === studySessions) {
        return [
          {
            id: "session-1",
            userId: "user-1",
            examId: "exam-1",
            topicId: "topic-1",
            schedulerRunId: "run-1",
            scheduledDate: "2026-05-12",
            plannedMinutes: 30,
            sessionType: "study",
            status: "planned",
            actualMinutes: null,
            notes: null,
            evaluationScore: null,
            completedScope: null,
            difficultyNotes: null,
            completedAt: null,
            createdAt: new Date().toISOString(),
          },
        ];
      }
      if (kind === "insert" && table === schedulerRuns) {
        return [{ id: "run-1" }];
      }
      if (kind === "insert" && table === notifications) {
        insertedNotifications.push(values);
        return [];
      }
      return [];
    });

    const response = await app.request(
      "/api/exams",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: "subject-1",
          name: "Kartkówka",
          examDate: "2026-05-20",
          topicNames: ["Algebra"],
        }),
      },
      createEnv(),
    );

    expect(response.status).toBe(201);

    const body = createExamResponseSchema.parse(await response.json());
    expect(body.schedulerRunId).toBe("run-1");
    expect(body.topics).toHaveLength(1);
    expect(body.sessions).toHaveLength(1);
    expect(insertedNotifications).toHaveLength(1);
  });

  it("returns 404 when exam subject does not belong to the user", async () => {
    setDb(({ kind, table }) => {
      if (kind === "select" && table === subjects) {
        return [];
      }
      return [];
    });

    const response = await app.request(
      "/api/exams",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: "missing-subject",
          name: "Kartkówka",
          examDate: "2026-05-20",
          topicNames: ["Algebra"],
        }),
      },
      createEnv(),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Subject not found" });
  });
});
