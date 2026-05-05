import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";

import { apiDelete, apiGet, apiPatch, apiPost } from "../../lib/api";
import { ApiNotificationSchema, OkResponseSchema } from "../../lib/schemas";
import { queryKeys } from "./keys";

import type {
  AppNotification,
  NotificationCreateInput,
} from "../../types/notifications";

type ApiNotification = z.infer<typeof ApiNotificationSchema>;

function mapNotification(notification: ApiNotification): AppNotification {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    description: notification.description ?? undefined,
    timestamp: Date.parse(notification.sentAt ?? notification.createdAt),
    read: notification.readAt !== null,
    actionUrl: notification.actionUrl ?? undefined,
  };
}

function mergeCreatedAt(
  notifications: ApiNotification[],
  created: ApiNotification,
): ApiNotification[] {
  return [created, ...notifications.filter((n) => n.id !== created.id)];
}

export function useNotificationInbox() {
  const qc = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async () => {
      const res = await apiGet(
        "/api/notifications",
        ApiNotificationSchema.array(),
      );
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });

  const notifications = useMemo(
    () => notificationsQuery.data?.map(mapNotification) ?? [],
    [notificationsQuery.data],
  );
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const addNotification = useMutation({
    mutationFn: async (input: NotificationCreateInput) => {
      const res = await apiPost("/api/notifications", ApiNotificationSchema, {
        ...input,
      });
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (created) => {
      qc.setQueryData(queryKeys.notifications, (current?: ApiNotification[]) =>
        mergeCreatedAt(current ?? [], created),
      );
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiPatch(
        `/api/notifications/${id}/read`,
        OkResponseSchema,
        {},
      );
      if (!res.ok) throw new Error(res.message);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData(queryKeys.notifications, (current?: ApiNotification[]) =>
        (current ?? []).map((notification) =>
          notification.id === id
            ? {
                ...notification,
                readAt: notification.readAt ?? new Date().toISOString(),
              }
            : notification,
        ),
      );
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await apiPatch(
        "/api/notifications/read-all",
        OkResponseSchema,
        {},
      );
      if (!res.ok) throw new Error(res.message);
      return true;
    },
    onSuccess: () => {
      const now = new Date().toISOString();
      qc.setQueryData(queryKeys.notifications, (current?: ApiNotification[]) =>
        (current ?? []).map((notification) =>
          notification.readAt === null
            ? { ...notification, readAt: now }
            : notification,
        ),
      );
    },
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      const res = await apiDelete("/api/notifications", OkResponseSchema);
      if (!res.ok) throw new Error(res.message);
      return true;
    },
    onSuccess: () => {
      qc.setQueryData(queryKeys.notifications, []);
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    isFetched: notificationsQuery.isFetched,
    addNotification: addNotification.mutateAsync,
    markAsRead: markAsRead.mutateAsync,
    markAllRead: markAllRead.mutateAsync,
    clearAll: clearAll.mutateAsync,
  };
}
