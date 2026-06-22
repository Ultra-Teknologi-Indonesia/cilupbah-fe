import { fetchClient } from "@/lib/api-client"
import type {
  OnlinePriceResponse,
  OnlinePriceRow,
  OnlinePriceListParams,
  OfflinePriceResponse,
  OfflinePriceRow,
  OfflinePriceListParams,
  ChannelHeader,
  LocationHeader,
  PageMeta,
  UpdateOnlinePriceItem,
  UpdateOfflinePriceItem,
} from "@/types/harga/price"
import type { ApiResponse } from "@/types/api.types"

function mapOnlineRow(r: OnlinePriceResponse["data"][number]): OnlinePriceRow {
  return {
    variantId: r.variant_id,
    productId: r.product_id,
    productName: r.product_name,
    sku: r.sku,
    thumbnail: r.thumbnail,
    variationValues: r.variation_values,
    sellPrice: r.sell_price,
    buyPrice: r.buy_price,
    prices: r.prices,
  }
}

function mapOfflineRow(r: OfflinePriceResponse["data"][number]): OfflinePriceRow {
  return {
    variantId: r.variant_id,
    productId: r.product_id,
    productName: r.product_name,
    sku: r.sku,
    thumbnail: r.thumbnail,
    variationValues: r.variation_values,
    sellPrice: r.sell_price,
    buyPrice: r.buy_price,
    priceByLocation: r.price_by_location,
  }
}

function buildQuery(params: object): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
  }
  return q.toString()
}

export const PriceService = {
  online: async (
    params: OnlinePriceListParams = {}
  ): Promise<{ items: OnlinePriceRow[]; channels: ChannelHeader[]; meta: PageMeta }> => {
    const res = await fetchClient<OnlinePriceResponse>(
      `/prices/online?${buildQuery(params)}`
    )
    return {
      items: (res.data ?? []).map(mapOnlineRow),
      channels: res.channels ?? [],
      meta: res.meta,
    }
  },

  offline: async (
    params: OfflinePriceListParams = {}
  ): Promise<{ items: OfflinePriceRow[]; locations: LocationHeader[]; meta: PageMeta }> => {
    const res = await fetchClient<OfflinePriceResponse>(
      `/prices/offline?${buildQuery(params)}`
    )
    return {
      items: (res.data ?? []).map(mapOfflineRow),
      locations: res.locations ?? [],
      meta: res.meta,
    }
  },

  updateOnline: async (items: UpdateOnlinePriceItem[]): Promise<{ updated: number }> => {
    const res = await fetchClient<ApiResponse<{ updated: number }>>(
      "/prices/online",
      { method: "PUT", data: { items } }
    )
    return res.data
  },

  updateOffline: async (items: UpdateOfflinePriceItem[]): Promise<{ updated: number }> => {
    const res = await fetchClient<ApiResponse<{ updated: number }>>(
      "/prices/offline",
      { method: "PUT", data: { items } }
    )
    return res.data
  },
}
