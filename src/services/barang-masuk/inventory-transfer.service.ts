import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated } from "@/types/api.types"
import type { InventoryTransfer, InventoryTransferListParams } from "@/types/barang-masuk/inventory-transfer"

export const InventoryTransferService = {
  listIncoming: async (params: InventoryTransferListParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("filter[search]", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("limit", String(params.per_page))
    if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
    if (params["filter[destination_location_id]"]) sp.set("filter[destination_location_id]", params["filter[destination_location_id]"])
    if (params["filter[date_from]"]) sp.set("filter[date_from]", params["filter[date_from]"])
    if (params["filter[date_to]"]) sp.set("filter[date_to]", params["filter[date_to]"])
    if (params.sort) sp.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<InventoryTransfer>>(`/v1/inventory/transfers/in?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },
}
