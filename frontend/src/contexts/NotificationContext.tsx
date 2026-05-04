import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type NotificationType =
  | "note_generated"
  | "exam_created"
  | "session_completed"
  | "scan_completed"
  | "exam_deleted"
  | "data_exported";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

type NotificationAddInput = Omit<AppNotification, "id" | "timestamp" | "read">;

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (input: NotificationAddInput) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
}

const STORAGE_KEY = "notifications";
const MAX_STORED = 50;

function loadStored(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as AppNotification[];
  } catch {
    return [];
  }
}

function persist(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications.slice(0, MAX_STORED)),
    );
  } catch {
    /* ignore quota errors */
  }
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadStored(),
  );

  useEffect(() => {
    persist(notifications);
  }, [notifications]);

  const addNotification = useCallback((input: NotificationAddInput) => {
    const notification: AppNotification = {
      ...input,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value: NotificationContextValue = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllRead,
    }),
    [notifications, unreadCount, addNotification, markAsRead, markAllRead],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return ctx;
}
