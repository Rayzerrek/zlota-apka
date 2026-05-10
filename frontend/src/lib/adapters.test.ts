import { describe, expect, it } from "vitest";

import {
  adaptApiCardToCard,
  adaptApiExamToExam,
  adaptApiSessionToStudySession,
  toSubjectKey,
} from "./adapters";

describe("toSubjectKey", () => {
  it("maps legacy aliases to supported frontend subject keys", () => {
    expect(toSubjectKey("math")).toBe("mat");
    expect(toSubjectKey("Biologia")).toBe("bio");
    expect(toSubjectKey("history")).toBe("hist");
    expect(toSubjectKey("english")).toBe("ang");
  });

  it("returns other for unknown or missing subject keys", () => {
    expect(toSubjectKey(null)).toBe("other");
    expect(toSubjectKey("geografia")).toBe("other");
  });
});

describe("API adapters", () => {
  it("does not fall back to matematyka for unknown card subjects", () => {
    const card = adaptApiCardToCard({
      id: "card-1",
      topicId: "topic-1",
      front: "Pytanie",
      back: "Odpowiedź",
      source: "manual",
      stability: 0,
      difficulty: 5,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: 0,
      lastReview: null,
      due: "2026-05-10T00:00:00.000Z",
      createdAt: "2026-05-10T00:00:00.000Z",
      updatedAt: "2026-05-10T00:00:00.000Z",
      topicName: "Mapa Europy",
      subjectKey: "geografia",
    });

    expect(card.subject).toBe("other");
  });

  it("normalizes session and exam aliases", () => {
    const session = adaptApiSessionToStudySession({
      id: "session-1",
      userId: "user-1",
      examId: null,
      topicId: "topic-1",
      schedulerRunId: null,
      scheduledDate: "2026-05-10",
      plannedMinutes: 30,
      actualMinutes: null,
      sessionType: "study",
      status: "planned",
      notes: null,
      evaluationScore: null,
      completedScope: null,
      difficultyNotes: null,
      completedAt: null,
      createdAt: "2026-05-10T00:00:00.000Z",
      subjectKey: "physics",
      topicName: "Dynamika",
    });

    const exam = adaptApiExamToExam({
      id: "exam-1",
      subjectId: "subject-1",
      name: "Kartkówka",
      examDate: "2026-05-11",
      difficulty: 3,
      materialSize: "medium",
      subjectKey: "chemistry",
    });

    expect(session.subject).toBe("fiz");
    expect(exam.subject).toBe("chem");
  });
});
