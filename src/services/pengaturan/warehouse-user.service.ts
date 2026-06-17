import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated } from "@/types/api.types"
import type { WarehouseUser } from "@/types/pengaturan/location"

type RawUser = { id: string; name: string; email: string }

export const WarehouseUserService = {
  // Daftar user untuk dropdown "Default Staff". /users dipaginasi -> ambil banyak sekaligus.
  list: async (search?: string): Promise<WarehouseUser[]> => {
    const q = new URLSearchParams({ per_page: "200" })
    if (search) q.set("search", search)
    const res = await fetchClient<ApiPaginated<RawUser>>(`/users?${q.toString()}`)
    return (res.data ?? []).map((u) => ({ id: u.id, name: u.name, email: u.email }))
  },
}
