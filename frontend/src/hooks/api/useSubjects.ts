import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPost } from "../../lib/api";
import { ApiErrorException } from "../../lib/error";
import { ApiSubjectSchema } from "../../lib/schemas";
import { queryKeys } from "./keys";

export function useSubjects() {
  return useQuery({
    queryKey: queryKeys.subjects,
    queryFn: async () => {
      const res = await apiGet("/api/subjects", ApiSubjectSchema.array());
      if (!res.ok) throw new ApiErrorException(res.error);
      return res.data;
    },
  });
}

export type SubjectCreateBody = {
  key: string;
  name: string;
  color: string;
  difficulty: number;
};

export function useCreateSubject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: SubjectCreateBody) => {
      const res = await apiPost("/api/subjects", ApiSubjectSchema, body);
      if (!res.ok) throw new ApiErrorException(res.error);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.subjects });
    },
  });
}
