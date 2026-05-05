import { describe, expect, it } from "vitest";

import {
  ApiCardSchema,
  ApiDashboardExamSchema,
  ApiDashboardSchema,
  ApiDashboardSessionSchema,
  ApiExamSchema,
  ApiNotificationSchema,
  ApiReviewHistorySchema,
  ApiSessionSchema,
  ApiSubjectSchema,
  ApiTopicSchema,
  ApiUserAvailabilitySchema,
  ApiUserSchema,
  ExamCreateResponseSchema,
  OkResponseSchema,
  ScanResponseSchema,
  UseExamDataSchema,
} from "./schemas";

describe("ApiSubjectSchema", () => {
  it("parses valid subject", () => {
    const result = ApiSubjectSchema.parse({
      id: "1",
      key: "math",
      name: "Matematyka",
      color: "#ff0000",
      difficulty: 3,
    });
    expect(result).toEqual({
      id: "1",
      key: "math",
      name: "Matematyka",
      color: "#ff0000",
      difficulty: 3,
    });
  });

  it("rejects missing fields", () => {
    expect(() => ApiSubjectSchema.parse({ id: "1" })).toThrow();
  });

  it("rejects wrong types", () => {
    expect(() =>
      ApiSubjectSchema.parse({
        id: "1",
        key: "math",
        name: "Matematyka",
        color: "#ff0000",
        difficulty: "easy",
      }),
    ).toThrow();
  });
});

describe("ApiTopicSchema", () => {
  it("parses valid topic", () => {
    const result = ApiTopicSchema.parse({
      id: "1",
      name: "Algebra",
      position: 1,
    });
    expect(result).toEqual({ id: "1", name: "Algebra", position: 1 });
  });

  it("rejects missing position", () => {
    expect(() => ApiTopicSchema.parse({ id: "1", name: "Algebra" })).toThrow();
  });
});

describe("ApiSessionSchema", () => {
  const valid = {
    id: "1",
    topicId: "t1",
    scheduledDate: "2024-01-01",
    plannedMinutes: 30,
    sessionType: "review",
    status: "pending",
  };

  it("parses valid session", () => {
    expect(ApiSessionSchema.parse(valid)).toEqual(valid);
  });

  it("rejects invalid scheduledDate type", () => {
    expect(() =>
      ApiSessionSchema.parse({ ...valid, scheduledDate: 123 }),
    ).toThrow();
  });
});

describe("ApiExamSchema", () => {
  const valid = {
    id: "1",
    subjectId: "s1",
    name: "Matura",
    examDate: "2024-05-01",
    difficulty: 5,
    materialSize: "large",
  };

  it("parses valid exam", () => {
    expect(ApiExamSchema.parse(valid)).toEqual(valid);
  });

  it("rejects invalid materialSize", () => {
    expect(() =>
      ApiExamSchema.parse({ ...valid, materialSize: "huge" }),
    ).toThrow();
  });
});

describe("ExamCreateResponseSchema", () => {
  it("parses valid response", () => {
    const result = ExamCreateResponseSchema.parse({
      exam: {
        id: "1",
        subjectId: "s1",
        name: "Matura",
        examDate: "2024-05-01",
        difficulty: 5,
        materialSize: "large",
      },
      topics: [{ id: "t1", name: "Algebra", position: 1 }],
      sessions: [
        {
          id: "s1",
          topicId: "t1",
          scheduledDate: "2024-01-01",
          plannedMinutes: 30,
          sessionType: "review",
          status: "pending",
        },
      ],
      schedulerRunId: "run-1",
    });
    expect(result.schedulerRunId).toBe("run-1");
  });
});

describe("ApiDashboardSessionSchema", () => {
  it("parses with nullable fields", () => {
    const result = ApiDashboardSessionSchema.parse({
      id: "1",
      scheduledDate: "2024-01-01",
      plannedMinutes: 30,
      sessionType: "review",
      status: "pending",
      topicId: null,
      topicName: null,
      subjectKey: null,
      subjectName: null,
    });
    expect(result.topicId).toBeNull();
  });

  it("parses with non-null fields", () => {
    const result = ApiDashboardSessionSchema.parse({
      id: "1",
      scheduledDate: "2024-01-01",
      plannedMinutes: 30,
      sessionType: "review",
      status: "pending",
      topicId: "t1",
      topicName: "Algebra",
      subjectKey: "math",
      subjectName: "Matematyka",
    });
    expect(result.topicId).toBe("t1");
  });
});

describe("ApiDashboardExamSchema", () => {
  it("parses with nullable subject fields", () => {
    const result = ApiDashboardExamSchema.parse({
      id: "1",
      name: "Matura",
      examDate: "2024-05-01",
      difficulty: 3,
      materialSize: "medium",
      subjectKey: null,
      subjectName: null,
    });
    expect(result.subjectKey).toBeNull();
  });
});

describe("ApiDashboardSchema", () => {
  const valid = {
    today: [],
    overdueCount: 1,
    upcomingExams: [],
    week: { total: 10, completed: 5, progressPercent: 50 },
  };

  it("parses valid dashboard", () => {
    expect(ApiDashboardSchema.parse(valid)).toEqual(valid);
  });

  it("rejects invalid week", () => {
    expect(() =>
      ApiDashboardSchema.parse({
        ...valid,
        week: { total: 10, completed: 5 },
      }),
    ).toThrow();
  });
});

describe("ApiCardSchema", () => {
  const valid = {
    id: "1",
    topicId: "t1",
    front: "pytanie",
    back: "odpowiedź",
    source: "manual",
    stability: 0.5,
    difficulty: 0.3,
    elapsedDays: 0,
    scheduledDays: 1,
    reps: 0,
    lapses: 0,
    state: 0,
    lastReview: null,
    due: "2024-01-01",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  };

  it("parses valid card", () => {
    expect(ApiCardSchema.parse(valid)).toEqual(valid);
  });

  it("rejects invalid source", () => {
    expect(() =>
      ApiCardSchema.parse({ ...valid, source: "unknown" }),
    ).toThrow();
  });
});

describe("ApiNotificationSchema", () => {
  const valid = {
    id: "1",
    userId: "u1",
    type: "exam_created",
    category: "exam",
    priority: "medium",
    title: "Nowy sprawdzian",
    description: null,
    actionUrl: "/calendar",
    payload: null,
    scheduledFor: null,
    sentAt: "2024-01-01T10:00:00.000Z",
    readAt: null,
    dismissedAt: null,
    createdAt: "2024-01-01T10:00:00.000Z",
  };

  it("parses valid notification", () => {
    expect(ApiNotificationSchema.parse(valid)).toEqual(valid);
  });
});

describe("ApiReviewHistorySchema", () => {
  const valid = {
    id: "1",
    cardId: "c1",
    sessionId: null,
    rating: 3,
    stateBefore: 0,
    stabilityBefore: 0.5,
    difficultyBefore: 0.3,
    scheduledDays: 1,
    elapsedDays: 0,
    reviewedAt: "2024-01-01",
  };

  it("parses valid review", () => {
    expect(ApiReviewHistorySchema.parse(valid)).toEqual(valid);
  });
});

describe("ApiUserAvailabilitySchema", () => {
  it("parses valid availability", () => {
    const result = ApiUserAvailabilitySchema.parse({
      id: "1",
      dayOfWeek: 1,
      availableMinutes: 120,
    });
    expect(result.availableMinutes).toBe(120);
  });
});

describe("ApiUserSchema", () => {
  const valid = {
    id: "1",
    name: "Jan",
    email: "jan@example.com",
    emailVerified: true,
    image: null,
    grade: null,
    onboardingDone: false,
    availability: [{ id: "a1", dayOfWeek: 1, availableMinutes: 120 }],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  };

  it("parses valid user", () => {
    expect(ApiUserSchema.parse(valid)).toEqual(valid);
  });
});

describe("ScanResponseSchema", () => {
  it("parses with text", () => {
    expect(ScanResponseSchema.parse({ text: "scanned" })).toEqual({
      text: "scanned",
    });
  });

  it("parses empty object", () => {
    expect(ScanResponseSchema.parse({})).toEqual({});
  });
});

describe("OkResponseSchema", () => {
  it("parses ok: true", () => {
    expect(OkResponseSchema.parse({ ok: true })).toEqual({ ok: true });
  });

  it("parses ok: false", () => {
    expect(OkResponseSchema.parse({ ok: false })).toEqual({ ok: false });
  });
});

describe("UseExamDataSchema", () => {
  it("parses valid exam data", () => {
    const result = UseExamDataSchema.parse({
      exam: {
        id: "1",
        subjectId: "s1",
        name: "Matura",
        examDate: "2024-05-01",
        difficulty: 5,
        materialSize: "small",
      },
      topics: [],
      sessions: [],
    });
    expect(result.exam.name).toBe("Matura");
  });
});
