export type NotificationType =
  | "note_generated"
  | "exam_created"
  | "session_completed"
  | "scan_completed"
  | "exam_deleted"
  | "data_exported"
  | "overdue_reminder"
  | "exam_reminder";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

export type NotificationCreateInput = Omit<
  AppNotification,
  "id" | "timestamp" | "read"
>;
