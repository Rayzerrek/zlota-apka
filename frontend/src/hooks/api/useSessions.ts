import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPatch } from "../../lib/api";
import { queryKeys } from "./keys";

import type { ApiSession } from "../../types/api";

export function useSessions(params?: {
  date?: string;
  from?: string;
  to?: string;
}) {
  const search = new URLSearchParams();
  if (params?.date) search.set("date", params.date);
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);

  const qs = search.toString();
  const path = qs ? `/api/sessions?${qs}` : "/api/sessions";

  return useQuery({
    queryKey: queryKeys.sessions(params),
    queryFn: async () => {
      const res = await apiGet<ApiSession[]>(path);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });
}

export type CompleteSessionBody = {
  actualMinutes: number;
  evaluationScore?: number;
  completedScope?: "yes" | "no" | "partially";
  difficultyNotes?: string;
};

export function useCompleteSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: CompleteSessionBody;
    }) => {
      const res = await apiPatch<ApiSession>(
        `/api/sessions/${id}/complete`,
        body,
      );
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sessions() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useSkipSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiPatch<ApiSession>(`/api/sessions/${id}/skip`, {});
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sessions() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
