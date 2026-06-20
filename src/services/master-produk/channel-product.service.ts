import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"

export interface ChannelListingVariant {
  masterSku: string | null
  channelSku: string | null
  variation: string | null
  minPrice: number | null
  maxPrice: number | null
  thumbnail: string | null
}

export interface ChannelListing {
  /** external_product_id channel (dipakai unlink). */
  channelGroupId: string | null
  /** channel_shop UUID. */
  storeId: string | null
  /** marketplace shop_id (dipakai unlink + download). */
  shopId: string | null
  itemGroupName: string | null
  storeName: string | null
  channelId: string | null
  channelCode: string | null
  channelUrl: string | null
  syncStatus: string | null
  hasProductData: boolean
  thumbnail: string | null
  variants: ChannelListingVariant[]
}

export interface ChannelListingParams {
  search?: string
  /** marketplace shop_id. */
  shopId?: string
  channel?: string
  syncStatus?: string
  /** harga efektif varian minimal. */
  minPrice?: number
  /** harga efektif varian maksimal. */
  maxPrice?: number
  page?: number
  perPage?: number
}

export interface ChannelListingResult {
  items: ChannelListing[]
  meta: ApiPaginated<RawChannelListing>["meta"]
}

interface RawConnection {
  master_sku: string | null
  channel_sku: string | null
  product_variation: string | null
  min_price: number | null
  max_price: number | null
  thumbnail: string | null
}

interface RawChannelListing {
  channel_group_id: string | null
  store_id: string | null
  shop_id: string | null
  item_group_name: string | null
  min: string | null
  channel_id: string | null
  channel_code: string | null
  channel_url: string | null
  sync_status: string | null
  has_product_data: boolean
  product: RawConnection[]
}

/** Kunci baris stabil (satu listing = produk↔toko). */
export const channelListingRowId = (l: Pick<ChannelListing, "storeId" | "channelGroupId">) =>
  `${l.storeId ?? ""}:${l.channelGroupId ?? ""}`

function mapListing(raw: RawChannelListing): ChannelListing {
  const variants: ChannelListingVariant[] = (raw.product ?? []).map((p) => ({
    masterSku: p.master_sku,
    channelSku: p.channel_sku,
    variation: p.product_variation,
    minPrice: p.min_price,
    maxPrice: p.max_price,
    thumbnail: p.thumbnail || null,
  }))

  return {
    channelGroupId: raw.channel_group_id,
    storeId: raw.store_id,
    shopId: raw.shop_id,
    itemGroupName: raw.item_group_name,
    storeName: raw.min,
    channelId: raw.channel_id,
    channelCode: raw.channel_code,
    channelUrl: raw.channel_url,
    syncStatus: raw.sync_status,
    hasProductData: raw.has_product_data,
    thumbnail: variants.find((v) => v.thumbnail)?.thumbnail ?? null,
    variants,
  }
}

export const ChannelProductService = {
  list: async (params: ChannelListingParams = {}): Promise<ChannelListingResult> => {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    if (params.shopId) q.set("filter[shop_id]", params.shopId)
    if (params.channel) q.set("filter[channel]", params.channel)
    if (params.syncStatus) q.set("filter[sync_status]", params.syncStatus)
    if (params.minPrice != null) q.set("filter[min_price]", String(params.minPrice))
    if (params.maxPrice != null) q.set("filter[max_price]", String(params.maxPrice))
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 25))

    const res = await fetchClient<ApiPaginated<RawChannelListing>>(
      `/products/channel-products?${q.toString()}`
    )
    return { items: (res.data ?? []).map(mapListing), meta: res.meta }
  },

  show: async (id: string): Promise<ChannelListing> => {
    const res = await fetchClient<ApiResponse<RawChannelListing>>(
      `/products/channel-products/${id}`
    )
    return mapListing(res.data)
  },

  /** Putus koneksi listing dari channel (id = external_product_id). */
  unlink: async (
    channel: string,
    externalProductId: string,
    shopId: string
  ): Promise<void> => {
    await fetchClient(`/${channel}/products/${externalProductId}/link`, {
      method: "DELETE",
      data: { shop_id: shopId },
    })
  },

  activate: async (channel: string, externalProductId: string, shopId: string): Promise<void> => {
    await fetchClient(`/${channel}/products/${externalProductId}/activate`, {
      method: "PUT",
      data: { shop_id: shopId },
    })
  },

  deactivate: async (channel: string, externalProductId: string, shopId: string): Promise<void> => {
    await fetchClient(`/${channel}/products/${externalProductId}/deactivate`, {
      method: "PUT",
      data: { shop_id: shopId },
    })
  },

  /** Push harga & stok master ke channel (BE: job sync_price_stock). */
  syncPriceStock: async (channel: string, externalProductId: string, shopId: string): Promise<void> => {
    await fetchClient(`/${channel}/products/${externalProductId}/stock`, {
      method: "PUT",
      data: { shop_id: shopId },
    })
  },
}
