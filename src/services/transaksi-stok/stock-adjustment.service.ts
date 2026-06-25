import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type {
  StockAdjustment,
  StockAdjustmentListParams,
  StockAdjustmentFormData,
} from "@/types/transaksi-stok/stock-adjustment"

const BASE = "/inventory/adjustments/documents"

export const StockAdjustmentService = {
  list: async (params: StockAdjustmentListParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("search", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("per_page", String(params.per_page))
    if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
    if (params["filter[location_id]"]) sp.set("filter[location_id]", params["filter[location_id]"])
    if (params.sort) sp.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<StockAdjustment>>(`${BASE}?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<StockAdjustment>>(`${BASE}/${id}`)
    return res.data
  },

  create: async (data: StockAdjustmentFormData) => {
    const res = await fetchClient<ApiResponse<StockAdjustment>>(BASE, {
      method: "POST",
      data,
    })
    return res.data
  },

  approve: async (id: string, approvedBy: string) => {
    const res = await fetchClient<ApiResponse<StockAdjustment>>(`${BASE}/${id}/approve`, {
      method: "POST",
      data: { approved_by: approvedBy },
    })
    return res.data
  },

  cancel: async (id: string) => {
    const res = await fetchClient<ApiResponse<StockAdjustment>>(`${BASE}/${id}/cancel`, {
      method: "POST",
    })
    return res.data
  },

  delete: async (id: string) => {
    await fetchClient(`${BASE}/${id}`, { method: "DELETE" })
  },
}
