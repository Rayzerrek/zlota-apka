import type {
  ApiExtendedCardSchema,
  ApiExtendedExamSchema,
  ApiExtendedSessionSchema,
  ApiReviewHistorySchema,
} from "../lib/schemas";
import type { z } from "zod";

export type ApiExtendedCard = z.infer<typeof ApiExtendedCardSchema>;
export type ApiExtendedExam = z.infer<typeof ApiExtendedExamSchema>;
export type ApiExtendedSession = z.infer<typeof ApiExtendedSessionSchema>;
export type ApiReviewHistory = z.infer<typeof ApiReviewHistorySchema>;
