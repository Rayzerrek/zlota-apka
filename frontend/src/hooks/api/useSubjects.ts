import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../lib/api";
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
