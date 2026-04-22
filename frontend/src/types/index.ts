export type SubjectKey =
  | "mat"
  | "bio"
  | "hist"
  | "pol"
  | "chem"
  | "fiz"
  | "ang";

export type Subject = {
  key: SubjectKey;
  name: string;
  color: string;
};

export type CardStage = "new" | "learning" | "review" | "due";

export type Card = {
  id: string;
  subject: SubjectKey;
  topic: string;
  question: string;
  answer: string;
  stage: CardStage;
  dueISO: string;
  intervalDays: number;
  ease: number;
  reps: number;
  lapses: number;
};

export type Rating = 1 | 2 | 3 | 4;

export const RATING_AGAIN = 1 satisfies Rating;
export const RATING_HARD = 2 satisfies Rating;
export const RATING_GOOD = 3 satisfies Rating;
export const RATING_EASY = 4 satisfies Rating;

export type StudySession = {
  id: string;
  dateISO: string;
  timeOfDay: string;
  subject: SubjectKey;
  topic: string;
  cardIds: string[];
  estimateMinutes: number;
  done: boolean;
};

export type Exam = {
  id: string;
  name: string;
  subject: SubjectKey;
  dateISO: string;
};

export type ReviewHistoryEntry = {
  cardId: string;
  dateISO: string;
  rating: Rating;
};
