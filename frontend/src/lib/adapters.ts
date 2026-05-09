import type {
  Card,
  CardStage,
  Exam,
  ReviewHistoryEntry,
  StudySession,
  SubjectKey,
} from "../types";
import type {
  ApiCard,
  ApiExtendedCard,
  ApiExtendedExam,
  ApiExtendedSession,
  ApiReviewHistory,
} from "./schema-types";

const SUBJECT_KEYS = new Set<string>([
  "mat",
  "bio",
  "hist",
  "pol",
  "chem",
  "fiz",
  "ang",
]);

function toSubjectKey(key: string | null): SubjectKey | null {
  if (key && SUBJECT_KEYS.has(key)) return key as SubjectKey;
  return null;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function computeStage(state: number, dueIso: string): CardStage {
  if (state === 0) return "new";
  if (state === 1) return "learning";
  if (state === 2) {
    return dueIso <= isoDate(new Date()) ? "due" : "review";
  }
  return "new";
}

export function adaptApiCardToCard(apiCard: ApiExtendedCard | ApiCard): Card {
  const dueIso =
    typeof apiCard.due === "string"
      ? apiCard.due.slice(0, 10)
      : isoDate(new Date());
  const extended = apiCard as ApiExtendedCard;
  return {
    id: apiCard.id,
    subject: toSubjectKey(extended.subjectKey) ?? "mat",
    topic: extended.topicName ?? "",
    question: apiCard.front,
    answer: apiCard.back,
    stage: computeStage(apiCard.state, dueIso),
    dueISO: dueIso,
    intervalDays: apiCard.scheduledDays,
    ease: apiCard.stability,
    reps: apiCard.reps,
    lapses: apiCard.lapses,
  };
}

export function adaptApiSessionToStudySession(
  apiSession: ApiExtendedSession,
): StudySession {
  return {
    id: apiSession.id,
    dateISO: apiSession.scheduledDate,
    timeOfDay: "",
    subject: toSubjectKey(apiSession.subjectKey) ?? "mat",
    topic: apiSession.topicName ?? "",
    cardIds: [],
    estimateMinutes: apiSession.plannedMinutes,
    done: apiSession.status === "completed",
  };
}

export function adaptApiExamToExam(apiExam: ApiExtendedExam): Exam {
  return {
    id: apiExam.id,
    name: apiExam.name,
    subject: toSubjectKey(apiExam.subjectKey) ?? "mat",
    dateISO: apiExam.examDate,
  };
}

export function adaptApiReviewHistoryToEntry(
  entry: ApiReviewHistory,
): ReviewHistoryEntry {
  return {
    cardId: entry.cardId,
    dateISO:
      typeof entry.reviewedAt === "string"
        ? entry.reviewedAt.slice(0, 10)
        : isoDate(new Date()),
    rating: Math.min(
      4,
      Math.max(1, entry.rating),
    ) as ReviewHistoryEntry["rating"],
  };
}
