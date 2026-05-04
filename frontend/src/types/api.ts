export type ApiSubject = {
  id: string;
  key: string;
  name: string;
  color: string;
  difficulty: number;
};

export type ApiTopic = {
  id: string;
  name: string;
  position: number;
};

export type ApiSession = {
  id: string;
  topicId: string;
  scheduledDate: string;
  plannedMinutes: number;
  sessionType: string;
  status: string;
};

export type ApiExam = {
  id: string;
  subjectId: string;
  name: string;
  examDate: string;
  difficulty: number;
  materialSize: "small" | "medium" | "large";
};

export type ExamCreateResponse = {
  exam: ApiExam;
  topics: ApiTopic[];
  sessions: ApiSession[];
  schedulerRunId: string;
};

export type ApiDashboardSession = {
  id: string;
  scheduledDate: string;
  plannedMinutes: number;
  sessionType: string;
  status: string;
  topicId: string | null;
  topicName: string | null;
  subjectKey: string | null;
  subjectName: string | null;
};

export type ApiDashboardExam = {
  id: string;
  name: string;
  examDate: string;
  difficulty: number;
  materialSize: "small" | "medium" | "large";
  subjectKey: string | null;
  subjectName: string | null;
};

export type ApiDashboard = {
  today: ApiDashboardSession[];
  overdueCount: number;
  upcomingExams: ApiDashboardExam[];
  week: { total: number; completed: number; progressPercent: number };
};

export type ApiCard = {
  id: string;
  topicId: string;
  front: string;
  back: string;
  source: "manual" | "ai";
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: number;
  lastReview: string | null;
  due: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiReviewHistory = {
  id: string;
  cardId: string;
  sessionId: string | null;
  rating: number;
  stateBefore: number;
  stabilityBefore: number;
  difficultyBefore: number;
  scheduledDays: number;
  elapsedDays: number;
  reviewedAt: string;
};

export type ApiGeneratedNote = {
  id: string;
  title: string;
  subject: string | null;
  content: string;
  createdAt: string;
};

export type ApiUserAvailability = {
  id: string;
  dayOfWeek: number;
  availableMinutes: number;
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  grade: string | null;
  onboardingDone: boolean;
  availability: ApiUserAvailability[];
  createdAt: string;
  updatedAt: string;
};

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; status: number; message: string };
export type ApiResult<T> = ApiOk<T> | ApiErr;
