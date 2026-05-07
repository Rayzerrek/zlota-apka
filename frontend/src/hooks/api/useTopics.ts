import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../lib/api";
import { ApiTopicSchema, ApiTopicWithSubjectSchema } from "../../lib/schemas";
import { queryKeys } from "./keys";

export function useAllTopics() {
  return useQuery({
    queryKey: queryKeys.allTopics,
    queryFn: async () => {
      const res = await apiGet(
        "/api/topics",
        ApiTopicWithSubjectSchema.array(),
      );
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useTopicsByExam(examId: string) {
  return useQuery({
    queryKey: queryKeys.topicsByExam(examId),
    queryFn: async () => {
      const res = await apiGet(
        `/api/exams/${examId}/topics`,
        ApiTopicSchema.array(),
      );
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    enabled: Boolean(examId),
  });
}
