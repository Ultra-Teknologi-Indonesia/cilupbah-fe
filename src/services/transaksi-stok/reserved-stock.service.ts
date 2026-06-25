import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type {
  ReservedStock,
  ReservedStockListParams,
  ReservedStockFormData,
} from "@/types/transaksi-stok/reserved-stock"

const BASE = "/inventory/reserved-stocks"

export const ReservedStockService = {
  list: async (params: ReservedStockListParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("search", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("per_page", String(params.per_page))
    if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
    if (params["filter[location_id]"]) sp.set("filter[location_id]", params["filter[location_id]"])
    if (params.sort) sp.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<ReservedStock>>(`${BASE}?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<ReservedStock>>(`${BASE}/${id}`)
    return res.data
  },

  create: async (data: ReservedStockFormData) => {
    const res = await fetchClient<ApiResponse<ReservedStock>>(BASE, {
      method: "POST",
      data,
    })
    return res.data
  },

  cancel: async (id: string) => {
    const res = await fetchClient<ApiResponse<ReservedStock>>(`${BASE}/${id}/cancel`, {
      method: "POST",
    })
    return res.data
  },
}
