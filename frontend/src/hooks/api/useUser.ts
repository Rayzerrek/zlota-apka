import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../lib/api";
import { queryKeys } from "./keys";

import type { ApiUser } from "../../types/api";

export function useUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: async () => {
      const res = await apiGet<ApiUser>("/api/users/me");
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });
}
