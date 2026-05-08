import { z } from "zod";

export const idParamsSchema = z.object({ id: z.string() });
export const examIdParamsSchema = z.object({ examId: z.string() });
export const topicIdParamsSchema = z.object({ topicId: z.string() });

export const subjectCreateSchema = z.object({
  key: z.string().min(1).max(64),
  name: z.string().min(1).max(128),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  difficulty: z.number().int().min(1).max(5),
});

export const subjectPatchSchema = subjectCreateSchema.partial();

export const topicCreateSchema = z.object({
  name: z.string().min(1).max(256),
  subjectId: z.string().min(1),
  position: z.number().int().min(0).default(0),
});

export const topicPatchSchema = z.object({
  name: z.string().min(1).max(256).optional(),
  position: z.number().int().min(0).optional(),
});

export const sessionCompleteSchema = z.object({
  actualMinutes: z.number().int().min(1),
  evaluationScore: z.number().int().min(1).max(5).optional(),
  completedScope: z.enum(["yes", "no", "partially"]).optional(),
  difficultyNotes: z.string().max(500).optional(),
});

export const sessionDateQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const onboardingAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  availableMinutes: z.number().int().min(0).max(720),
});

export const onboardingSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  grade: z.string().min(1).max(32),
  subjects: z.array(subjectCreateSchema).min(1),
  availability: z.array(onboardingAvailabilitySchema),
});

export const examCreateSchema = z.object({
  subjectId: z.string().min(1),
  name: z.string().min(1).max(256),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  difficulty: z.number().int().min(1).max(5).default(3),
  materialSize: z.enum(["small", "medium", "large"]).default("medium"),
  notes: z.string().max(1000).optional(),
  topicNames: z.array(z.string().min(1).max(256)).default([]),
});

export const examPatchSchema = z.object({
  name: z.string().min(1).max(256).optional(),
  examDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  materialSize: z.enum(["small", "medium", "large"]).optional(),
  notes: z.string().max(1000).optional(),
});

export const cardCreateSchema = z.object({
  front: z.string().min(1).max(2000),
  back: z.string().min(1).max(2000),
  source: z.enum(["manual", "ai"]).default("manual"),
});

export const cardReviewSchema = z.object({
  rating: z.number().int().min(1).max(4),
  sessionId: z.string().optional(),
});

export const notificationTypeSchema = z.enum([
  "note_generated",
  "exam_created",
  "session_completed",
  "scan_completed",
  "exam_deleted",
  "data_exported",
  "overdue_reminder",
  "exam_reminder",
]);

export const notificationCategorySchema = z.enum([
  "exam",
  "session",
  "review",
  "ai",
  "system",
]);

export const notificationPrioritySchema = z.enum(["low", "medium", "high"]);

export const notificationCreateSchema = z.object({
  type: notificationTypeSchema,
  title: z.string().min(1).max(256),
  description: z.string().max(1000).optional(),
  actionUrl: z.string().min(1).max(512).optional(),
  category: notificationCategorySchema.optional(),
  priority: notificationPrioritySchema.optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const userPatchSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  grade: z.string().min(1).max(32).nullable().optional(),
  image: z.string().url().nullable().optional(),
  onboardingDone: z.boolean().optional(),
});

export const userAvailabilityResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  dayOfWeek: z.number().int().min(0).max(6),
  availableMinutes: z.number().int().min(0),
});

export const userMeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  grade: z.string().nullable(),
  onboardingDone: z.boolean(),
  availability: z.array(userAvailabilityResponseSchema),
});

export const userExportResponseSchema = z.object({
  user: userMeResponseSchema.omit({ availability: true }),
  subjects: z.array(z.record(z.string(), z.unknown())),
  availability: z.array(userAvailabilityResponseSchema),
  exams: z.array(z.record(z.string(), z.unknown())),
  topics: z.array(z.record(z.string(), z.unknown())),
  sessions: z.array(z.record(z.string(), z.unknown())),
  cards: z.array(z.record(z.string(), z.unknown())),
  reviewHistory: z.array(z.record(z.string(), z.unknown())),
  exportedAt: z.string(),
});

export const okResponseSchema = z.object({
  // boolean (nie literal(true)) — handlery z wieloma branchami (200 + 404)
  // unionują typy zwracane, co rozszerza literal `true` do `boolean` po stronie TS.
  ok: z.boolean(),
});

// ---------------------------------------------------------------------------
// Response schemas (kształty zwracane przez handlery — używane w OpenAPI doc)
// Konwencja timestampów: Drizzle zwraca Date, JSON serializuje do string —
// schemat akceptuje obie formy, identycznie jak userMeResponseSchema powyżej.
// ---------------------------------------------------------------------------

const dbTimestamp = z.union([z.string(), z.date()]);

export const subjectRowSchema = z.object({
  id: z.string(),
  userId: z.string(),
  key: z.string(),
  name: z.string(),
  color: z.string(),
  difficulty: z.number().int(),
});
export const subjectListResponseSchema = z.array(subjectRowSchema);

export const topicRowSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subjectId: z.string(),
  examId: z.string().nullable(),
  name: z.string(),
  position: z.number().int(),
  createdAt: dbTimestamp,
});
export const topicListResponseSchema = z.array(topicRowSchema);

export const topicWithSubjectSchema = topicRowSchema.extend({
  subjectName: z.string().nullable(),
  examName: z.string().nullable(),
});
export const topicWithSubjectListResponseSchema = z.array(
  topicWithSubjectSchema,
);

export const examRowSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subjectId: z.string(),
  name: z.string(),
  examDate: z.string(),
  difficulty: z.number().int(),
  materialSize: z.enum(["small", "medium", "large"]),
  notes: z.string().nullable(),
  createdAt: dbTimestamp,
});
export const examListItemSchema = examRowSchema.extend({
  subjectKey: z.string().nullable(),
});
export const examListResponseSchema = z.array(examListItemSchema);

export const sessionRowSchema = z.object({
  id: z.string(),
  userId: z.string(),
  examId: z.string().nullable(),
  topicId: z.string().nullable(),
  schedulerRunId: z.string().nullable(),
  scheduledDate: z.string(),
  plannedMinutes: z.number().int(),
  actualMinutes: z.number().int().nullable(),
  sessionType: z.enum(["study", "review", "quick_review"]),
  status: z.enum(["planned", "completed", "skipped"]),
  notes: z.string().nullable(),
  evaluationScore: z.number().int().nullable(),
  completedScope: z.enum(["yes", "no", "partially"]).nullable(),
  difficultyNotes: z.string().nullable(),
  completedAt: dbTimestamp.nullable(),
  createdAt: dbTimestamp,
});
export const sessionWithJoinSchema = sessionRowSchema.extend({
  topicName: z.string().nullable(),
  subjectKey: z.string().nullable(),
});
export const sessionListResponseSchema = z.array(sessionWithJoinSchema);

export const examCreateResponseSchema = z.object({
  exam: examRowSchema,
  topics: z.array(topicRowSchema),
  sessions: z.array(sessionRowSchema),
  schedulerRunId: z.string(),
});
export const examDetailResponseSchema = z.object({
  exam: examRowSchema,
  topics: z.array(topicRowSchema),
  sessions: z.array(sessionRowSchema),
});

export const cardRowSchema = z.object({
  id: z.string(),
  userId: z.string(),
  topicId: z.string(),
  front: z.string(),
  back: z.string(),
  source: z.enum(["manual", "ai"]),
  stability: z.number(),
  difficulty: z.number(),
  elapsedDays: z.number().int(),
  scheduledDays: z.number().int(),
  reps: z.number().int(),
  lapses: z.number().int(),
  state: z.number().int(),
  lastReview: dbTimestamp.nullable(),
  due: dbTimestamp,
  createdAt: dbTimestamp,
  updatedAt: dbTimestamp,
});
export const cardListResponseSchema = z.array(cardRowSchema);

// allCardsRoute robi explicit select bez userId, z dołączonymi topicName/subjectKey
export const cardWithJoinSchema = cardRowSchema.omit({ userId: true }).extend({
  topicName: z.string().nullable(),
  subjectKey: z.string().nullable(),
});
export const cardAllListResponseSchema = z.array(cardWithJoinSchema);

export const reviewHistoryRowSchema = z.object({
  id: z.string(),
  cardId: z.string(),
  sessionId: z.string().nullable(),
  rating: z.number().int(),
  stateBefore: z.number().int(),
  stabilityBefore: z.number(),
  difficultyBefore: z.number(),
  scheduledDays: z.number().int(),
  elapsedDays: z.number().int(),
  reviewedAt: dbTimestamp,
});
export const reviewHistoryListResponseSchema = z.array(reviewHistoryRowSchema);

export const notificationRowSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  category: notificationCategorySchema,
  priority: notificationPrioritySchema,
  title: z.string(),
  description: z.string().nullable(),
  actionUrl: z.string().nullable(),
  // payload: jsonb w Drizzle bez $type<> — może być null lub dowolny JSON.
  // z.unknown() obejmuje null po stronie TS; klient i tak parsuje payload sam.
  payload: z.unknown(),
  scheduledFor: dbTimestamp.nullable(),
  sentAt: dbTimestamp.nullable(),
  readAt: dbTimestamp.nullable(),
  dismissedAt: dbTimestamp.nullable(),
  createdAt: dbTimestamp,
});
export const notificationListResponseSchema = z.array(notificationRowSchema);

export const paginatedNotificationsResponseSchema = z.object({
  rows: notificationListResponseSchema,
  totalCount: z.number().int(),
});

export const dashboardSessionSchema = z.object({
  id: z.string(),
  scheduledDate: z.string(),
  plannedMinutes: z.number().int(),
  sessionType: z.enum(["study", "review", "quick_review"]),
  status: z.enum(["planned", "completed", "skipped"]),
  topicId: z.string().nullable(),
  topicName: z.string().nullable(),
  subjectKey: z.string().nullable(),
  subjectName: z.string().nullable(),
});
export const dashboardExamSchema = z.object({
  id: z.string(),
  name: z.string(),
  examDate: z.string(),
  difficulty: z.number().int(),
  materialSize: z.enum(["small", "medium", "large"]),
  subjectKey: z.string().nullable(),
  subjectName: z.string().nullable(),
});
export const dashboardResponseSchema = z.object({
  today: z.array(dashboardSessionSchema),
  overdueCount: z.number().int(),
  upcomingExams: z.array(dashboardExamSchema),
  week: z.object({
    total: z.number().int(),
    completed: z.number().int(),
    progressPercent: z.number().int(),
  }),
});
