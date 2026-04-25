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
  ok: z.literal(true),
});
