import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGet, apiPost } from "../../lib/api";
import { queryKeys } from "./keys";

import type { ApiExam, ExamCreateResponse } from "../../types/api";

export function useExams() {
  return useQuery({
    queryKey: queryKeys.exams,
    queryFn: async () => {
      const res = await apiGet<ApiExam[]>("/api/exams");
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useExam(id: string) {
  return useQuery<{
    exam: ApiExam;
    topics: import("../../types/api").ApiTopic[];
    sessions: import("../../types/api").ApiSession[];
  }>({
    queryKey: queryKeys.exam(id),
    queryFn: async () => {
      const res = await apiGet<{
        exam: ApiExam;
        topics: import("../../types/api").ApiTopic[];
        sessions: import("../../types/api").ApiSession[];
      }>(`/api/exams/${id}`);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export type ExamCreateBody = {
  subjectId: string;
  name: string;
  examDate: string;
  difficulty?: number;
  materialSize?: "small" | "medium" | "large";
  notes?: string;
  topicNames: string[];
};

export function useCreateExam() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: ExamCreateBody) => {
      const res = await apiPost<ExamCreateResponse>("/api/exams", body);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exams });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiDelete<{ ok: boolean }>(`/api/exams/${id}`);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exams });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
