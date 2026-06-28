import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type { PurchaseReturn, PurchaseReturnListParams, CreatePurchaseReturnPayload } from "@/types/barang-keluar/purchase-return"

export const PurchaseReturnService = {
  list: async (params: PurchaseReturnListParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("filter[search]", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("limit", String(params.per_page))
    if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
    if (params["filter[supplier_id]"]) sp.set("filter[supplier_id]", params["filter[supplier_id]"])
    if (params["filter[location_id]"]) sp.set("filter[location_id]", params["filter[location_id]"])
    if (params["filter[date_from]"]) sp.set("filter[date_from]", params["filter[date_from]"])
    if (params["filter[date_to]"]) sp.set("filter[date_to]", params["filter[date_to]"])
    if (params.sort) sp.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<PurchaseReturn>>(`/purchase/purchase-returns?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<PurchaseReturn>>(`/purchase/purchase-returns/${id}`)
    return res.data
  },

  create: async (data: CreatePurchaseReturnPayload) => {
    const res = await fetchClient<ApiResponse<PurchaseReturn>>("/purchase/purchase-returns", {
      method: "POST",
      data,
    })
    return res.data
  },

  process: async (id: string, data: { processed_by: string }) => {
    const res = await fetchClient<ApiResponse<PurchaseReturn>>(`/purchase/purchase-returns/${id}/process`, {
      method: "POST",
      data,
    })
    return res.data
  },

  delete: async (id: string) => {
    const res = await fetchClient<ApiResponse<unknown>>("/purchase", {
      method: "DELETE",
      data: { id },
    })
    return res.data
  },
}
