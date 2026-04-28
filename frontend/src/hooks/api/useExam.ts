import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../lib/api";
import { queryKeys } from "./keys";

import type { ApiExam, ApiSession, ApiTopic } from "../../types/api";

export function useExam(id: string) {
  return useQuery<{
    exam: ApiExam;
    topics: ApiTopic[];
    sessions: ApiSession[];
  }>({
    queryKey: queryKeys.exam(id),
    queryFn: async () => {
      const res = await apiGet<{
        exam: ApiExam;
        topics: ApiTopic[];
        sessions: ApiSession[];
      }>(`/api/exams/${id}`);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    enabled: Boolean(id),
  });
}
