import {
  ApiCardSchema,
  ApiDashboardExamSchema,
  ApiDashboardSchema,
  ApiDashboardSessionSchema,
  ApiExamSchema,
  ApiExtendedCardSchema,
  ApiExtendedExamSchema,
  ApiExtendedSessionSchema,
  ApiNotificationSchema,
  ApiReviewHistorySchema,
  ApiSessionSchema,
  ApiSubjectSchema,
  ApiTopicSchema,
  ApiTopicWithSubjectSchema,
  ApiUserAvailabilitySchema,
  ApiUserSchema,
  ExamCreateResponseSchema,
  GeneratedNoteSchema,
  OkResponseSchema,
  PaginatedNotificationsSchema,
  ScanResponseSchema,
  UseExamDataSchema,
} from "./schemas";

import type { z } from "zod";

export type ApiSubject = z.infer<typeof ApiSubjectSchema>;
export type ApiTopic = z.infer<typeof ApiTopicSchema>;
export type ApiTopicWithSubject = z.infer<typeof ApiTopicWithSubjectSchema>;
export type ApiSession = z.infer<typeof ApiSessionSchema>;
export type ApiExtendedSession = z.infer<typeof ApiExtendedSessionSchema>;
export type ApiExam = z.infer<typeof ApiExamSchema>;
export type ApiExtendedExam = z.infer<typeof ApiExtendedExamSchema>;
export type ExamCreateResponse = z.infer<typeof ExamCreateResponseSchema>;
export type ApiDashboardSession = z.infer<typeof ApiDashboardSessionSchema>;
export type ApiDashboardExam = z.infer<typeof ApiDashboardExamSchema>;
export type ApiDashboard = z.infer<typeof ApiDashboardSchema>;
export type ApiCard = z.infer<typeof ApiCardSchema>;
export type ApiExtendedCard = z.infer<typeof ApiExtendedCardSchema>;
export type ApiNotification = z.infer<typeof ApiNotificationSchema>;
export type PaginatedNotifications = z.infer<
  typeof PaginatedNotificationsSchema
>;
export type ApiReviewHistory = z.infer<typeof ApiReviewHistorySchema>;
export type ApiGeneratedNote = z.infer<typeof GeneratedNoteSchema>;
export type ApiUserAvailability = z.infer<typeof ApiUserAvailabilitySchema>;
export type ApiUser = z.infer<typeof ApiUserSchema>;
export type ScanResponse = z.infer<typeof ScanResponseSchema>;
export type OkResponse = z.infer<typeof OkResponseSchema>;
export type UseExamData = z.infer<typeof UseExamDataSchema>;
