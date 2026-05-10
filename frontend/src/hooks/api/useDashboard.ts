import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../lib/api";
import { ApiErrorException } from "../../lib/error";
import { ApiDashboardSchema } from "../../lib/schemas";
import { queryKeys } from "./keys";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const res = await apiGet("/api/dashboard", ApiDashboardSchema);
      if (!res.ok) throw new ApiErrorException(res.error);
      return res.data;
    },
  });
}
