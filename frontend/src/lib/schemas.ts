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

export const ApiTopicWithSubjectSchema = ApiTopicSchema.extend({
  userId: z.string(),
  subjectId: z.string(),
  examId: z.string().nullable(),
  createdAt: z.string(),
  subjectName: z.string().nullable(),
  examName: z.string().nullable(),
});

export const ApiSessionSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  scheduledDate: z.string(),
  plannedMinutes: z.number(),
  sessionType: z.string(),
  status: z.string(),
});

export const ApiExtendedSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  examId: z.string().nullable(),
  topicId: z.string().nullable(),
  schedulerRunId: z.string().nullable(),
  scheduledDate: z.string(),
  plannedMinutes: z.number(),
  actualMinutes: z.number().nullable(),
  sessionType: z.string(),
  status: z.string(),
  notes: z.string().nullable(),
  evaluationScore: z.number().nullable(),
  completedScope: z.string().nullable(),
  difficultyNotes: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  topicName: z.string().nullable(),
  subjectKey: z.string().nullable(),
});

export const ApiExamSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  name: z.string(),
  examDate: z.string(),
  difficulty: z.number(),
  materialSize: z.enum(["small", "medium", "large"]),
});

export const ApiExtendedExamSchema = ApiExamSchema.extend({
  subjectKey: z.string().nullable(),
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
  overdueCount: z.number(),
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

export const ApiExtendedCardSchema = ApiCardSchema.extend({
  topicName: z.string().nullable(),
  subjectKey: z.string().nullable(),
});

export const ApiNotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum([
    "note_generated",
    "exam_created",
    "session_completed",
    "scan_completed",
    "exam_deleted",
    "data_exported",
    "overdue_reminder",
    "exam_reminder",
  ]),
  category: z.enum(["exam", "session", "review", "ai", "system"]),
  priority: z.enum(["low", "medium", "high"]),
  title: z.string(),
  description: z.string().nullable(),
  actionUrl: z.string().nullable(),
  payload: z.unknown().nullable(),
  scheduledFor: z.string().nullable(),
  sentAt: z.string().nullable(),
  readAt: z.string().nullable(),
  dismissedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const PaginatedNotificationsSchema = z.object({
  rows: z.array(ApiNotificationSchema),
  totalCount: z.number().int(),
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
  isGuest: z.boolean(),
  availability: z.array(ApiUserAvailabilitySchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ScanResponseSchema = z.object({
  text: z.string().optional(),
});

export const GeneratedNoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string().nullable(),
  content: z.string(),
  createdAt: z.string(),
});

export const GenerateNoteRequestSchema = z.object({
  topic: z.string().min(1),
  subject: z.string().optional(),
});

export const OkResponseSchema = z.object({
  ok: z.boolean(),
});

export const UseExamDataSchema = z.object({
  exam: ApiExamSchema,
  topics: z.array(ApiTopicSchema),
  sessions: z.array(ApiSessionSchema),
});
