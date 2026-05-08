import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";

import { apiDelete, apiGet, apiPatch, apiPost } from "../../lib/api";
import {
  ApiNotificationSchema,
  OkResponseSchema,
  PaginatedNotificationsSchema,
} from "../../lib/schemas";
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

export function useNotificationInbox(page = 1, perPage = 100) {
  const qc = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: [...queryKeys.notifications, { page, perPage }],
    queryFn: async () => {
      const res = await apiGet(
        `/api/notifications?page=${page}&perPage=${perPage}`,
        PaginatedNotificationsSchema,
      );
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });

  const notifications = useMemo(
    () => notificationsQuery.data?.rows.map(mapNotification) ?? [],
    [notificationsQuery.data],
  );
  const totalCount = notificationsQuery.data?.totalCount ?? 0;
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
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
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      const res = await apiDelete("/api/notifications", OkResponseSchema);
      if (!res.ok) throw new Error(res.message);
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });

  return {
    notifications,
    unreadCount,
    totalCount,
    isLoading: notificationsQuery.isLoading,
    isFetched: notificationsQuery.isFetched,
    addNotification: addNotification.mutateAsync,
    markAsRead: markAsRead.mutateAsync,
    markAllRead: markAllRead.mutateAsync,
    clearAll: clearAll.mutateAsync,
  };
}
