import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGet, apiPost } from "../../lib/api";
import { ApiErrorException } from "../../lib/error";
import {
  ApiCardSchema,
  ApiExtendedCardSchema,
  ApiReviewHistorySchema,
  OkResponseSchema,
} from "../../lib/schemas";
import { queryKeys } from "./keys";

export function useCardsDue() {
  return useQuery({
    queryKey: queryKeys.cardsDue,
    queryFn: async () => {
      const res = await apiGet("/api/cards/due", ApiExtendedCardSchema.array());
      if (!res.ok) throw new ApiErrorException(res.error);
      return res.data;
    },
  });
}

export function useCardsByTopic(topicId: string) {
  return useQuery({
    queryKey: queryKeys.cardsByTopic(topicId),
    queryFn: async () => {
      const res = await apiGet(
        `/api/topics/${topicId}/cards`,
        ApiExtendedCardSchema.array(),
      );
      if (!res.ok) throw new ApiErrorException(res.error);
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
      const res = await apiPost(
        `/api/topics/${topicId}/cards`,
        ApiCardSchema,
        body,
      );
      if (!res.ok) throw new ApiErrorException(res.error);
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
      const res = await apiDelete(`/api/cards/${id}`, OkResponseSchema);
      if (!res.ok) throw new ApiErrorException(res.error);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cardsDue });
      qc.invalidateQueries({ queryKey: queryKeys.allCards });
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
      const res = await apiPost(`/api/cards/${id}/review`, ApiCardSchema, body);
      if (!res.ok) throw new ApiErrorException(res.error);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cardsDue });
    },
  });
}

export function useAllCards() {
  return useQuery({
    queryKey: queryKeys.allCards,
    queryFn: async () => {
      const res = await apiGet("/api/cards", ApiExtendedCardSchema.array());
      if (!res.ok) throw new ApiErrorException(res.error);
      return res.data;
    },
  });
}

export function useReviewHistory() {
  return useQuery({
    queryKey: queryKeys.reviewHistory,
    queryFn: async () => {
      const res = await apiGet(
        "/api/cards/review-history",
        ApiReviewHistorySchema.array(),
      );
      if (!res.ok) throw new ApiErrorException(res.error);
      return res.data;
    },
  });
}
