import { fetchClient } from "@/lib/api-client";
import type { ApiPaginated } from "@/types/api.types";
import type { WarehouseUser } from "@/types/manajemen-rak/location";

type RawUser = {
  user_id: string | number;
  email: string;
  last_login: string | null;
  is_owner: boolean;
};
export const WarehouseUserService = {
  list: async (q?: string): Promise<WarehouseUser[]> => {
    const params = new URLSearchParams({ per_page: "200", page: "1" });
    if (q) params.set("q", q);
    const res = await fetchClient<ApiPaginated<RawUser>>(
      `/users/lookup?${params.toString()}`,
    );
    return (res.data ?? []).map((u) => ({
      id: String(u.user_id),
      email: u.email,
      isOwner: u.is_owner,
      lastLogin: u.last_login,
    }));
  },
};
