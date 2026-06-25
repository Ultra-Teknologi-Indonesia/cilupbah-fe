import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated } from "@/types/api.types"
import type { Putaway, PutawayListParams } from "@/types/barang-masuk/putaway"

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
}
