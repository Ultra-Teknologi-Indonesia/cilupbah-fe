import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type {
  StockRevaluation,
  StockRevaluationListParams,
  StockRevaluationFormData,
} from "@/types/transaksi-stok/stock-revaluation"

const BASE = "/inventory/amount-adjustments"

export const StockRevaluationService = {
  list: async (params: StockRevaluationListParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("search", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("per_page", String(params.per_page))
    if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
    if (params["filter[location_id]"]) sp.set("filter[location_id]", params["filter[location_id]"])
    if (params.sort) sp.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<StockRevaluation>>(`${BASE}?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<StockRevaluation>>(`${BASE}/${id}`)
    return res.data
  },

  create: async (data: StockRevaluationFormData) => {
    const res = await fetchClient<ApiResponse<StockRevaluation>>(BASE, {
      method: "POST",
      data,
    })
    return res.data
  },

  cancel: async (id: string) => {
    const res = await fetchClient<ApiResponse<StockRevaluation>>(`${BASE}/${id}/cancel`, {
      method: "POST",
    })
    return res.data
  },
}
