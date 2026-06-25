import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type { Putaway, PutawayItem, PutawayListParams } from "@/types/barang-masuk/putaway"

export interface AssignStaffPayload {
  data: { putaway_id: string; assigned_to: number }[]
  performed_by: string
}

export interface ProcessItemPayload {
  destination_bin_id: string
  qty: number
}

export interface BinLookupResult {
  id: string
  location_id: string
  bin_final_code: string
  bin_label: string | null
  is_inbound: boolean
}

export const PutawayService = {
  list: async (params: PutawayListParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("filter[search]", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("limit", String(params.per_page))
    if (params["filter[location_id]"]) sp.set("filter[location_id]", params["filter[location_id]"])
    if (params["filter[date_from]"]) sp.set("filter[date_from]", params["filter[date_from]"])
    if (params["filter[date_to]"]) sp.set("filter[date_to]", params["filter[date_to]"])
    if (params.sort) sp.set("sort", params.sort)

    let endpoint = "/v1/putaway"
    if (params["filter[status]"]) {
      const statusMap: Record<string, string> = {
        NOT_STARTED: "/v1/putaway/not-started",
        IN_PROGRESS: "/v1/putaway/in-progress",
        COMPLETED: "/v1/putaway/completed",
      }
      endpoint = statusMap[params["filter[status]"]] ?? endpoint
    }

    const res = await fetchClient<ApiPaginated<Putaway>>(`${endpoint}?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<Putaway>>(`/v1/putaway/${id}`)
    return res.data
  },

  getItems: async (id: string, limit = 50) => {
    const res = await fetchClient<ApiPaginated<PutawayItem>>(`/v1/putaway/${id}/items?limit=${limit}`)
    return res.data ?? []
  },

  assignStaff: async (payload: AssignStaffPayload) => {
    const res = await fetchClient<ApiResponse<unknown>>("/v1/putaway/assign-staff", {
      method: "POST",
      data: payload,
    })
    return res.data
  },

  start: async (id: string) => {
    const res = await fetchClient<ApiResponse<Putaway>>(`/v1/putaway/${id}/start`, {
      method: "POST",
    })
    return res.data
  },

  processItem: async (id: string, itemId: string, payload: ProcessItemPayload) => {
    const res = await fetchClient<ApiResponse<unknown>>(`/v1/putaway/${id}/items/${itemId}/process`, {
      method: "POST",
      data: payload,
    })
    return res.data
  },

  complete: async (id: string) => {
    const res = await fetchClient<ApiResponse<Putaway>>(`/v1/putaway/${id}/complete`, {
      method: "POST",
    })
    return res.data
  },

  lookupBin: async (code: string, locationId: string) => {
    const res = await fetchClient<ApiResponse<BinLookupResult>>(`/v1/putaway/bins/lookup?code=${encodeURIComponent(code)}&location_id=${encodeURIComponent(locationId)}`)
    return res.data
  },
}
