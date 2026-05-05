/* eslint-disable react-refresh/only-export-components */

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { useNotificationInbox } from "../hooks/api/useNotifications";

import type {
  AppNotification,
  NotificationCreateInput,
} from "../types/notifications";

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isFetched: boolean;
  addNotification: (input: NotificationCreateInput) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const inbox = useNotificationInbox();
  const {
    addNotification: postNotification,
    clearAll,
    isFetched,
    isLoading,
    markAllRead,
    markAsRead,
    notifications,
    unreadCount,
  } = inbox;
  const addNotification = useCallback(
    async (input: NotificationCreateInput) => {
      if (localStorage.getItem("settings.notifications") === "false") return;
      await postNotification(input);
    },
    [postNotification],
  );
  const markAsReadAction = useCallback(
    async (id: string) => {
      await markAsRead(id);
    },
    [markAsRead],
  );
  const markAllReadAction = useCallback(async () => {
    await markAllRead();
  }, [markAllRead]);
  const clearAllAction = useCallback(async () => {
    await clearAll();
  }, [clearAll]);
  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      isFetched,
      addNotification,
      markAsRead: markAsReadAction,
      markAllRead: markAllReadAction,
      clearAll: clearAllAction,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      isFetched,
      addNotification,
      markAsReadAction,
      markAllReadAction,
      clearAllAction,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export type { AppNotification, NotificationType } from "../types/notifications";

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return ctx;
}
