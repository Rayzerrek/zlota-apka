import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGet, apiPost } from "../../lib/api";
import { queryKeys } from "./keys";

import type { ApiCard } from "../../types/api";

export function useCardsDue() {
  return useQuery({
    queryKey: queryKeys.cardsDue,
    queryFn: async () => {
      const res = await apiGet<ApiCard[]>("/api/cards/due");
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useCardsByTopic(topicId: string) {
  return useQuery({
    queryKey: queryKeys.cardsByTopic(topicId),
    queryFn: async () => {
      const res = await apiGet<ApiCard[]>(`/api/topics/${topicId}/cards`);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    enabled: Boolean(topicId),
  });
}

export type CreateCardBody = {
  front: string;
  back: string;
  source?: "manual" | "ai";
};

export function useCreateCard() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      topicId,
      body,
    }: {
      topicId: string;
      body: CreateCardBody;
    }) => {
      const res = await apiPost<ApiCard>(`/api/topics/${topicId}/cards`, body);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: queryKeys.cardsByTopic(variables.topicId),
      });
      qc.invalidateQueries({ queryKey: queryKeys.cardsDue });
    },
  });
}

export function useDeleteCard() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiDelete<{ ok: boolean }>(`/api/cards/${id}`);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cardsDue });
    },
  });
}

export type ReviewCardBody = {
  rating: 1 | 2 | 3 | 4;
  sessionId?: string;
};

export function useReviewCard() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: ReviewCardBody }) => {
      const res = await apiPost<ApiCard>(`/api/cards/${id}/review`, body);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cardsDue });
    },
  });
}
