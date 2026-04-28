import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../lib/api";
import { queryKeys } from "./keys";

import type { ApiTopic } from "../../types/api";

export function useTopicsByExam(examId: string) {
  return useQuery({
    queryKey: queryKeys.topicsByExam(examId),
    queryFn: async () => {
      const res = await apiGet<ApiTopic[]>(`/api/exams/${examId}/topics`);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    enabled: Boolean(examId),
  });
}
