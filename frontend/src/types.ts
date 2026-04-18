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

export type Rating = 1 | 2 | 3 | 4 | 5;

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
  weight: number;
};

export type ReviewHistoryEntry = {
  cardId: string;
  dateISO: string;
  rating: Rating;
};

