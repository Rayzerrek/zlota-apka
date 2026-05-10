import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPost } from "../../lib/api";
import { ApiErrorException } from "../../lib/error";
import { GeneratedNoteSchema } from "../../lib/schemas";
import { queryKeys } from "./keys";

export function useGenerateNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: { topic: string; subject?: string }) => {
      const res = await apiPost("/api/notes", GeneratedNoteSchema, body);
      if (!res.ok) throw new ApiErrorException(res.error);
      return res.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.generatedNote(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useGeneratedNote(id: string) {
  return useQuery({
    queryKey: queryKeys.generatedNote(id),
    queryFn: async () => {
      const res = await apiGet(`/api/notes/${id}`, GeneratedNoteSchema);
      if (!res.ok) throw new ApiErrorException(res.error);
      return res.data;
    },
    enabled: Boolean(id),
    retry: false,
    staleTime: Infinity,
  });
}
