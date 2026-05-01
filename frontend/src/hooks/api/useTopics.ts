import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../lib/api";
import { ApiTopicSchema } from "../../lib/schemas";
import { queryKeys } from "./keys";

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
