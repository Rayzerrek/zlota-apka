import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../lib/api";
import { queryKeys } from "./keys";

import type { ApiDashboard } from "../../types/api";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const res = await apiGet<ApiDashboard>("/api/dashboard");
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });
}
