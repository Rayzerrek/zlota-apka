import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../lib/api";
import { UseExamDataSchema } from "../../lib/schemas";
import { queryKeys } from "./keys";

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
