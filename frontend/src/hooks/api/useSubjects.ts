import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../lib/api";
import { queryKeys } from "./keys";

import type { ApiSubject } from "../../types/api";

export function useSubjects() {
  return useQuery({
    queryKey: queryKeys.subjects,
    queryFn: async () => {
      const res = await apiGet<ApiSubject[]>("/api/subjects");
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });
}
