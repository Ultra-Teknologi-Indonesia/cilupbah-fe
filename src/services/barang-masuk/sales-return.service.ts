import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type { SalesReturn, SalesReturnListParams, SalesReturnFormData } from "@/types/barang-masuk/sales-return"

export const SalesReturnService = {
  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(`/sales/returns/${id}`)
    return res.data
  },

  create: async (data: SalesReturnFormData) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(`/sales/returns`, {
      method: "POST",
      data,
    })
    return res.data
  },

  unprocessed: async (params: SalesReturnListParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("filter[search]", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("limit", String(params.per_page))
    if (params["filter[location_id]"]) sp.set("filter[location_id]", params["filter[location_id]"])
    if (params["filter[date_from]"]) sp.set("filter[date_from]", params["filter[date_from]"])
    if (params["filter[date_to]"]) sp.set("filter[date_to]", params["filter[date_to]"])
    if (params.sort) sp.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<SalesReturn>>(`/sales/returns/unprocessed?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  list: async (params: SalesReturnListParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("filter[search]", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("limit", String(params.per_page))
    if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
    if (params["filter[source]"]) sp.set("filter[source]", params["filter[source]"])
    if (params["filter[location_id]"]) sp.set("filter[location_id]", params["filter[location_id]"])
    if (params["filter[date_from]"]) sp.set("filter[date_from]", params["filter[date_from]"])
    if (params["filter[date_to]"]) sp.set("filter[date_to]", params["filter[date_to]"])
    if (params.sort) sp.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<SalesReturn>>(`/sales/returns?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  accept: async (id: string, data: { processed_by: string }) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(`/sales/returns/${id}/accept`, {
      method: "POST",
      data,
    })
    return res.data
  },

  reject: async (id: string, data: { processed_by: string; reason?: string }) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(`/sales/returns/${id}/reject`, {
      method: "POST",
      data,
    })
    return res.data
  },

  complete: async (id: string, data: { processed_by: string }) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(`/sales/returns/${id}/complete`, {
      method: "POST",
      data,
    })
    return res.data
  },
}
