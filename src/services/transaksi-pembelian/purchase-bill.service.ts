import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type {
  PurchaseBill,
  PurchaseBillListParams,
  PurchaseBillFormData,
} from "@/types/transaksi-pembelian/purchase-bill"

export const PurchaseBillService = {
  list: async (params: PurchaseBillListParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("filter[search]", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("limit", String(params.per_page))
    if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
    if (params["filter[contact_id]"]) sp.set("filter[contact_id]", params["filter[contact_id]"])
    if (params["filter[location_id]"]) sp.set("filter[location_id]", params["filter[location_id]"])
    if (params["filter[date_from]"]) sp.set("filter[date_from]", params["filter[date_from]"])
    if (params["filter[date_to]"]) sp.set("filter[date_to]", params["filter[date_to]"])
    if (params.sort) sp.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<PurchaseBill>>(`/purchase/bills?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<PurchaseBill>>(`/purchase/bills/${id}`)
    return res.data
  },

  create: async (data: PurchaseBillFormData) => {
    const res = await fetchClient<ApiResponse<PurchaseBill>>("/purchase/bills", {
      method: "POST",
      data,
    })
    return res.data
  },

  update: async (id: string, data: PurchaseBillFormData) => {
    const res = await fetchClient<ApiResponse<PurchaseBill>>(`/purchase/bills/${id}`, {
      method: "PUT",
      data,
    })
    return res.data
  },

  delete: async (id: string) => {
    await fetchClient("/purchase/bills", {
      method: "DELETE",
      data: { id },
    })
  },
}
