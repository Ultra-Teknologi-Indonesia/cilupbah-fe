import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"

/** Baris varian dari GET /products/{id}/variants. */
export interface VariantRow {
  id: string
  sku: string
  barcode: string | null
  sellPrice: number | null
  isActive: boolean
  options: { attributeId: number; value: string }[]
  stock: number
}

interface RawVariantRow {
  id: string
  sku: string
  barcode: string | null
  sell_price: number | null
  is_active: boolean
  options?: Array<{ attribute_id: number; value: string }>
  stock?: number
}

export interface VariantsParams {
  page?: number
  perPage?: number
  search?: string
  option?: string
  /** Spatie sort: sku | sell_price | stock (awali "-" untuk desc). */
  sort?: string
}

type PageMeta = ApiPaginated<unknown>["meta"]

export interface VariantsResult {
  items: VariantRow[]
  meta: PageMeta
}

export type BulkVariantAction = "activate" | "deactivate" | "delete"

function mapRow(r: RawVariantRow): VariantRow {
  return {
    id: r.id,
    sku: r.sku,
    barcode: r.barcode,
    sellPrice: r.sell_price,
    isActive: r.is_active,
    options: (r.options ?? []).map((o) => ({ attributeId: o.attribute_id, value: o.value })),
    stock: r.stock ?? 0,
  }
}

// ── Channel listing (#4) ──────────────────────────────────────────────
export interface ChannelListingItem {
  channelShopId: string | null
  shopName: string | null
  channelName: string | null
  channelCode: string | null
  externalProductId: string | null
  syncStatus: string | null
  lastSyncedAt: string | null
}
export interface ChannelListingRow {
  variantId: string
  sku: string
  options: { attributeId: number; value: string }[]
  listings: ChannelListingItem[]
}
interface RawChannelListingRow {
  variant_id: string
  sku: string
  options?: Array<{ attribute_id: number; value: string }>
  listings?: Array<{
    channel_shop_id: string | null
    shop_name: string | null
    channel_name: string | null
    channel_code: string | null
    external_product_id: string | null
    sync_status: string | null
    last_synced_at: string | null
  }>
}

// ── Harga channel (#5) ────────────────────────────────────────────────
export interface ChannelPriceCell {
  channelShopId: string | null
  shopName: string | null
  channelCode: string | null
  price: number | null
}
export interface ChannelPriceRow {
  variantId: string
  sku: string
  options: { attributeId: number; value: string }[]
  internalPrice: number | null
  prices: ChannelPriceCell[]
}
interface RawChannelPriceRow {
  variant_id: string
  sku: string
  options?: Array<{ attribute_id: number; value: string }>
  internal_price: number | null
  prices?: Array<{
    channel_shop_id: string | null
    shop_name: string | null
    channel_code: string | null
    price: number | null
  }>
}

export interface ChannelTabParams {
  page?: number
  perPage?: number
  channel?: string
  includeUnlisted?: boolean
}

// ── Buku harga (price-book) ───────────────────────────────────────────
export interface PriceBookRow {
  id: string
  variantId: string
  sku: string | null
  customerType: string | null
  minQty: number | null
  maxQty: number | null
  price: number | null
}
interface RawPriceBookRow {
  id: string
  variant_id: string
  sku: string | null
  customer_type: string | null
  min_qty: number | null
  max_qty: number | null
  price: number | null
}
export interface PriceBookParams {
  page?: number
  perPage?: number
  /** Spatie sort: min_qty | customer_type | price (awali "-" untuk desc). */
  sort?: string
}

// ── Riwayat upload (upload-histories, di-scope product_id) ────────────
export interface UploadHistoryRow {
  id: string
  uploadDate: string | null
  success: boolean
  statusMessage: string | null
  canReupload: boolean
  shopName: string | null
  channelName: string | null
  channelCode: string | null
  channelUrl: string | null
}
interface RawUploadHistoryRow {
  id: string
  upload_date: string | null
  success: boolean
  status_message: string | null
  can_reupload: boolean
  max: string | null
  channel_name: string | null
  channel_code: string | null
  channel_url: string | null
}
export interface UploadHistoryParams {
  page?: number
  perPage?: number
  status?: string
}

function channelQuery(params: ChannelTabParams): string {
  const q = new URLSearchParams()
  if (params.page) q.set("page", String(params.page))
  if (params.perPage) q.set("per_page", String(params.perPage))
  if (params.channel) q.set("filter[channel]", params.channel)
  if (params.includeUnlisted) q.set("include_unlisted", "1")
  return q.toString()
}

const mapOptions = (o?: Array<{ attribute_id: number; value: string }>) =>
  (o ?? []).map((x) => ({ attributeId: x.attribute_id, value: x.value }))

export const ProductTabsService = {
  variants: async (productId: string, params: VariantsParams = {}): Promise<VariantsResult> => {
    const q = new URLSearchParams()
    if (params.page) q.set("page", String(params.page))
    if (params.perPage) q.set("per_page", String(params.perPage))
    if (params.search?.trim()) q.set("search", params.search.trim())
    if (params.option?.trim()) q.set("filter[option]", params.option.trim())
    if (params.sort) q.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<RawVariantRow>>(
      `/products/${productId}/variants?${q.toString()}`
    )
    return { items: (res.data ?? []).map(mapRow), meta: res.meta }
  },

  bulkVariants: async (
    productId: string,
    body: { action: BulkVariantAction; variant_ids: string[] }
  ): Promise<ApiResponse<{ affected?: number; deleted?: number; blocked?: string[] }>> => {
    return fetchClient(`/products/${productId}/variants/bulk`, { method: "POST", data: body })
  },

  channelListings: async (
    productId: string,
    params: ChannelTabParams = {}
  ): Promise<{ items: ChannelListingRow[]; meta: PageMeta }> => {
    const res = await fetchClient<ApiPaginated<RawChannelListingRow>>(
      `/products/${productId}/channel-listings?${channelQuery(params)}`
    )
    return {
      items: (res.data ?? []).map((r) => ({
        variantId: r.variant_id,
        sku: r.sku,
        options: mapOptions(r.options),
        listings: (r.listings ?? []).map((l) => ({
          channelShopId: l.channel_shop_id,
          shopName: l.shop_name,
          channelName: l.channel_name,
          channelCode: l.channel_code,
          externalProductId: l.external_product_id,
          syncStatus: l.sync_status,
          lastSyncedAt: l.last_synced_at,
        })),
      })),
      meta: res.meta,
    }
  },

  channelPrices: async (
    productId: string,
    params: ChannelTabParams = {}
  ): Promise<{ items: ChannelPriceRow[]; meta: PageMeta }> => {
    const res = await fetchClient<ApiPaginated<RawChannelPriceRow>>(
      `/products/${productId}/channel-prices?${channelQuery(params)}`
    )
    return {
      items: (res.data ?? []).map((r) => ({
        variantId: r.variant_id,
        sku: r.sku,
        options: mapOptions(r.options),
        internalPrice: r.internal_price,
        prices: (r.prices ?? []).map((p) => ({
          channelShopId: p.channel_shop_id,
          shopName: p.shop_name,
          channelCode: p.channel_code,
          price: p.price,
        })),
      })),
      meta: res.meta,
    }
  },

  priceBook: async (
    productId: string,
    params: PriceBookParams = {}
  ): Promise<{ items: PriceBookRow[]; meta: PageMeta }> => {
    const q = new URLSearchParams()
    if (params.page) q.set("page", String(params.page))
    if (params.perPage) q.set("per_page", String(params.perPage))
    if (params.sort) q.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<RawPriceBookRow>>(
      `/products/${productId}/price-book?${q.toString()}`
    )
    return {
      items: (res.data ?? []).map((r) => ({
        id: r.id,
        variantId: r.variant_id,
        sku: r.sku,
        customerType: r.customer_type,
        minQty: r.min_qty,
        maxQty: r.max_qty,
        price: r.price,
      })),
      meta: res.meta,
    }
  },

  uploadHistories: async (
    productId: string,
    params: UploadHistoryParams = {}
  ): Promise<{ items: UploadHistoryRow[]; meta: PageMeta }> => {
    const q = new URLSearchParams()
    q.set("filter[product_id]", productId)
    if (params.page) q.set("page", String(params.page))
    if (params.perPage) q.set("per_page", String(params.perPage))
    if (params.status) q.set("filter[status]", params.status)

    const res = await fetchClient<ApiPaginated<RawUploadHistoryRow>>(
      `/upload-histories?${q.toString()}`
    )
    return {
      items: (res.data ?? []).map((r) => ({
        id: r.id,
        uploadDate: r.upload_date,
        success: r.success,
        statusMessage: r.status_message,
        canReupload: r.can_reupload,
        shopName: r.max,
        channelName: r.channel_name,
        channelCode: r.channel_code,
        channelUrl: r.channel_url,
      })),
      meta: res.meta,
    }
  },

  reuploadHistory: async (id: string): Promise<ApiResponse<null>> => {
    return fetchClient(`/upload-histories/${id}/re-upload`, { method: "POST" })
  },
}
