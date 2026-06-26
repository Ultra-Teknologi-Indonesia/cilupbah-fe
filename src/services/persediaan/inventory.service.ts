import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"
import type {
  StockItem,
  StockListParams,
  StockMovement,
  StockMovementParams,
  BinInventory,
  StockListMeta,
} from "@/types/persediaan/stock"

interface StockListResponse extends ApiResponse<StockItem[]> {
  meta: StockListMeta
}

export const InventoryStockService = {
  list: (params: StockListParams) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("search", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("per_page", String(params.per_page))
    if (params["filter[product_id]"]) sp.set("filter[product_id]", params["filter[product_id]"])
    if (params["filter[location_id]"]) sp.set("filter[location_id]", params["filter[location_id]"])
    if (params["filter[is_bundle]"]) sp.set("filter[is_bundle]", params["filter[is_bundle]"])
    if (params["filter[channel]"]) sp.set("filter[channel]", params["filter[channel]"])
    if (params.sort) sp.set("sort", params.sort)

    return fetchClient<StockListResponse>(`/inventory?${sp}`)
  },

  movements: (params: StockMovementParams) => {
    const sp = new URLSearchParams()
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("per_page", String(params.per_page))
    if (params["filter[item_id]"]) sp.set("filter[item_id]", params["filter[item_id]"])
    if (params["filter[location_id]"]) sp.set("filter[location_id]", params["filter[location_id]"])
    if (params["filter[source]"]) sp.set("filter[source]", params["filter[source]"])
    if (params["filter[date_from]"]) sp.set("filter[date_from]", params["filter[date_from]"])
    if (params["filter[date_to]"]) sp.set("filter[date_to]", params["filter[date_to]"])
    if (params.sort) sp.set("sort", params.sort)

    return fetchClient<ApiPaginated<StockMovement>>(`/inventory/history?${sp}`)
  },

  getItem: (itemId: string) => {
    return fetchClient<ApiResponse<StockItem>>(`/inventory/${itemId}`)
  },

  getItemStock: (itemId: string) => {
    return fetchClient<ApiResponse<BinInventory[]>>(`/inventory/stocks/${itemId}`)
  },
}
