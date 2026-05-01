import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../lib/api";
import { ApiUserSchema } from "../../lib/schemas";
import { queryKeys } from "./keys";

export function useUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: async () => {
      const res = await apiGet("/api/users/me", ApiUserSchema);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });
}
