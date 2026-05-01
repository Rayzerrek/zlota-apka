import { z } from "zod";

export const ApiSubjectSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  color: z.string(),
  difficulty: z.number(),
});

export const ApiTopicSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: z.number(),
});

export const ApiSessionSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  scheduledDate: z.string(),
  plannedMinutes: z.number(),
  sessionType: z.string(),
  status: z.string(),
});

export const ApiExamSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  name: z.string(),
  examDate: z.string(),
  difficulty: z.number(),
  materialSize: z.enum(["small", "medium", "large"]),
});

export const ExamCreateResponseSchema = z.object({
  exam: ApiExamSchema,
  topics: z.array(ApiTopicSchema),
  sessions: z.array(ApiSessionSchema),
  schedulerRunId: z.string(),
});

export const ApiDashboardSessionSchema = z.object({
  id: z.string(),
  scheduledDate: z.string(),
  plannedMinutes: z.number(),
  sessionType: z.string(),
  status: z.string(),
  topicId: z.string().nullable(),
  topicName: z.string().nullable(),
  subjectKey: z.string().nullable(),
  subjectName: z.string().nullable(),
});

export const ApiDashboardExamSchema = z.object({
  id: z.string(),
  name: z.string(),
  examDate: z.string(),
  difficulty: z.number(),
  materialSize: z.enum(["small", "medium", "large"]),
  subjectKey: z.string().nullable(),
  subjectName: z.string().nullable(),
});

export const ApiDashboardSchema = z.object({
  today: z.array(ApiDashboardSessionSchema),
  overdue: z.array(z.object({ id: z.string() })),
  upcomingExams: z.array(ApiDashboardExamSchema),
  week: z.object({
    total: z.number(),
    completed: z.number(),
    progressPercent: z.number(),
  }),
});

export const ApiCardSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  front: z.string(),
  back: z.string(),
  source: z.enum(["manual", "ai"]),
  stability: z.number(),
  difficulty: z.number(),
  elapsedDays: z.number(),
  scheduledDays: z.number(),
  reps: z.number(),
  lapses: z.number(),
  state: z.number(),
  lastReview: z.string().nullable(),
  due: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ApiReviewHistorySchema = z.object({
  id: z.string(),
  cardId: z.string(),
  sessionId: z.string().nullable(),
  rating: z.number(),
  stateBefore: z.number(),
  stabilityBefore: z.number(),
  difficultyBefore: z.number(),
  scheduledDays: z.number(),
  elapsedDays: z.number(),
  reviewedAt: z.string(),
});

export const ApiUserAvailabilitySchema = z.object({
  id: z.string(),
  dayOfWeek: z.number(),
  availableMinutes: z.number(),
});

export const ApiUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  grade: z.string().nullable(),
  onboardingDone: z.boolean(),
  availability: z.array(ApiUserAvailabilitySchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ScanResponseSchema = z.object({
  text: z.string().optional(),
});

export const OkResponseSchema = z.object({
  ok: z.boolean(),
});

export const UseExamDataSchema = z.object({
  exam: ApiExamSchema,
  topics: z.array(ApiTopicSchema),
  sessions: z.array(ApiSessionSchema),
});
