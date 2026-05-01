import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGet, apiPost } from "../../lib/api";
import {
  ApiExamSchema,
  ExamCreateResponseSchema,
  OkResponseSchema,
  UseExamDataSchema,
} from "../../lib/schemas";
import { queryKeys } from "./keys";

export function useExams() {
  return useQuery({
    queryKey: queryKeys.exams,
    queryFn: async () => {
      const res = await apiGet("/api/exams", ApiExamSchema.array());
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useExam(id: string) {
  return useQuery({
    queryKey: queryKeys.exam(id),
    queryFn: async () => {
      const res = await apiGet(`/api/exams/${id}`, UseExamDataSchema);
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
      const res = await apiPost("/api/exams", ExamCreateResponseSchema, body);
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
      const res = await apiDelete(`/api/exams/${id}`, OkResponseSchema);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exams });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
