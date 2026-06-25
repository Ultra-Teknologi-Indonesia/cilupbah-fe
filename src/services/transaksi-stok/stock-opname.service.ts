import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type {
  StockOpname,
  StockOpnameItem,
  StockOpnameListParams,
  StockOpnameFormData,
} from "@/types/transaksi-stok/stock-opname"

const BASE = "/inventory/stock-opname"

export const StockOpnameService = {
  list: async (params: StockOpnameListParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("search", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("per_page", String(params.per_page))
    if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
    if (params["filter[location_id]"]) sp.set("filter[location_id]", params["filter[location_id]"])
    if (params.sort) sp.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<StockOpname>>(`${BASE}?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<StockOpname>>(`${BASE}/${id}`)
    return res.data
  },

  getItems: async (id: string, params: { page?: number; per_page?: number; search?: string } = {}) => {
    const sp = new URLSearchParams()
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("per_page", String(params.per_page))
    if (params.search) sp.set("search", params.search)

    const res = await fetchClient<ApiPaginated<StockOpnameItem>>(`${BASE}/${id}/items?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  create: async (data: StockOpnameFormData) => {
    const res = await fetchClient<ApiResponse<StockOpname>>(BASE, {
      method: "POST",
      data,
    })
    return res.data
  },

  start: async (id: string, processBy: string) => {
    const res = await fetchClient<ApiResponse<StockOpname>>(`${BASE}/${id}/start`, {
      method: "POST",
      data: { process_by: processBy },
    })
    return res.data
  },

  countItem: async (opnameId: string, itemId: string, data: { qty_actual: number; reason?: string; counted_by: string }) => {
    const res = await fetchClient<ApiResponse<StockOpnameItem>>(`${BASE}/${opnameId}/items/${itemId}/count`, {
      method: "POST",
      data,
    })
    return res.data
  },

  finalize: async (id: string, finalizedBy: string) => {
    const res = await fetchClient<ApiResponse<StockOpname>>(`${BASE}/${id}/finalize`, {
      method: "POST",
      data: { finalized_by: finalizedBy },
    })
    return res.data
  },

  cancel: async (id: string) => {
    const res = await fetchClient<ApiResponse<StockOpname>>(`${BASE}/${id}/cancel`, {
      method: "POST",
    })
    return res.data
  },

  delete: async (id: string) => {
    await fetchClient(`${BASE}/${id}`, { method: "DELETE" })
  },
}
