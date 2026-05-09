import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { adaptApiExamToExam } from "../../lib/adapters";
import { apiDelete, apiGet, apiPost } from "../../lib/api";
import {
  ApiExtendedExamSchema,
  ExamCreateResponseSchema,
  OkResponseSchema,
  UseExamDataSchema,
} from "../../lib/schemas";
import { queryKeys } from "./keys";

import type { ExamCreateResponse } from "../../lib/schema-types";

export function useExams() {
  return useQuery({
    queryKey: queryKeys.exams,
    queryFn: async () => {
      const res = await apiGet("/api/exams", ApiExtendedExamSchema.array());
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

  return useMutation<ExamCreateResponse, Error, ExamCreateBody>({
    mutationFn: async (body) => {
      const res = await apiPost("/api/exams", ExamCreateResponseSchema, body);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exams });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
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

export function useAllExams() {
  const { data, isLoading, error } = useExams();

  const exams = useMemo(() => {
    if (!data) return [];
    return data.map(adaptApiExamToExam);
  }, [data]);

  return { data: exams, isLoading, error };
}
