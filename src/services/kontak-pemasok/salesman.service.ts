import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type {
  SalesmanItem,
  SalesmanListParams,
  SalesmanFormData,
} from "@/types/kontak-pemasok/salesman"

export const SalesmanService = {
  list: async (params: SalesmanListParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("search", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("per_page", String(params.per_page))
    if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
    if (params.sort) sp.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<SalesmanItem>>(`/salesmen?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<SalesmanItem>>(`/salesmen/${id}`)
    return res.data
  },

  create: async (data: SalesmanFormData) => {
    const res = await fetchClient<ApiResponse<SalesmanItem>>("/salesmen", {
      method: "POST",
      data,
    })
    return res.data
  },

  update: async (id: string, data: SalesmanFormData) => {
    const res = await fetchClient<ApiResponse<SalesmanItem>>(`/salesmen/${id}`, {
      method: "PUT",
      data,
    })
    return res.data
  },

  delete: async (id: string) => {
    await fetchClient("/salesmen", {
      method: "DELETE",
      data: { id },
    })
  },

  getAll: async () => {
    const res = await fetchClient<ApiResponse<SalesmanItem[]>>("/salesmen/all")
    return res.data ?? []
  },
}
