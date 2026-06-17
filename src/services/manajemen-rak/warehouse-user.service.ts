import { fetchClient } from "@/lib/api-client"
import type { WarehouseUser } from "@/types/manajemen-rak/location"

// Endpoint lookup bergaya Jubelio: { data: [...], totalCount }. Auth saja (tanpa view-user).
type RawUser = {
  user_id: string | number
  email: string
  last_login: string | null
  is_owner: boolean
}
type LookupResponse = { data: RawUser[]; totalCount: number }

export const WarehouseUserService = {
  // Dropdown "Default Staff".
  list: async (q?: string): Promise<WarehouseUser[]> => {
    const params = new URLSearchParams({ pageSize: "200", page: "1" })
    if (q) params.set("q", q)
    const res = await fetchClient<LookupResponse>(
      `/systemsetting/users?${params.toString()}`
    )
    return (res.data ?? []).map((u) => ({
      id: String(u.user_id),
      email: u.email,
      isOwner: u.is_owner,
      lastLogin: u.last_login,
    }))
  },
}
