import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type { BrandItem } from "@/types/kategori-merek/brand"

export const BrandService = {
  getAll: async (search?: string): Promise<BrandItem[]> => {
    const params = new URLSearchParams({ all: "1" })
    if (search) params.set("search", search)
    const res = await fetchClient<ApiResponse<BrandItem[]>>(
      `/brands?${params.toString()}`
    )
    return res.data ?? []
  },

  getPaginated: async (params: {
    search?: string
    page?: number
    perPage?: number
    sort?: string
  } = {}): Promise<{ items: BrandItem[]; meta: { current_page: number; last_page: number; total: number } }> => {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 15))
    if (params.sort) q.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<BrandItem>>(
      `/brands?${q.toString()}`
    )
    return {
      items: res.data ?? [],
      meta: res.meta,
    }
  },

  create: async (data: { name: string }): Promise<BrandItem> => {
    const res = await fetchClient<ApiResponse<BrandItem>>("/brands", {
      method: "POST",
      data,
    })
    return res.data
  },

  update: async (id: number, data: { name: string }): Promise<BrandItem> => {
    const res = await fetchClient<ApiResponse<BrandItem>>(`/brands/${id}`, {
      method: "PUT",
      data,
    })
    return res.data
  },

  delete: async (id: number): Promise<void> => {
    await fetchClient(`/brands/${id}`, { method: "DELETE" })
  },
}
