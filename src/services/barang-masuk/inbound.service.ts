import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated } from "@/types/api.types"
import type { Inbound, InboundListParams } from "@/types/barang-masuk/inbound"

export const InboundService = {
  list: async (params: InboundListParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("filter[search]", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("limit", String(params.per_page))
    if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
    if (params["filter[type]"]) sp.set("filter[type]", params["filter[type]"])
    if (params["filter[location_id]"]) sp.set("filter[location_id]", params["filter[location_id]"])
    if (params["filter[source_type]"]) sp.set("filter[source_type]", params["filter[source_type]"])
    if (params["filter[date_from]"]) sp.set("filter[date_from]", params["filter[date_from]"])
    if (params["filter[date_to]"]) sp.set("filter[date_to]", params["filter[date_to]"])
    if (params.sort) sp.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<Inbound>>(`/v1/inbounds?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },
}
