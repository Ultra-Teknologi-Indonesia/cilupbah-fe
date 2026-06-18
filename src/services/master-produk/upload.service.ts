import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"

export type DraftStatus = "draft" | "ready" | "cancelled"

/* ── Tab Upload-to-Channel: daftar toko tujuan per produk ───────────────── */

export interface UploadListingParams {
  isUploaded?: boolean
  search?: string
  channel?: string
  page?: number
  perPage?: number
}

interface RawUploadListing {
  item_group_id: string
  item_group_name: string | null
  store_id: string
  shop_id: string | null
  store_name: string | null
  channel_id: string | null
  channel_code: string | null
  channel_name: string | null
  is_uploaded: boolean
  channel_group_id: string | null
  sync_status: string | null
  product_channels: Array<{
    master_sku: string | null
    channel_sku: string | null
    variation: string | null
  }>
}

export interface UploadDestination {
  itemGroupId: string
  itemGroupName: string | null
  /** channel_shop UUID — dipakai untuk match (store_ids). */
  storeId: string
  /** marketplace shop_id — dipakai untuk membuat draft/upload. */
  shopId: string | null
  storeName: string | null
  channelId: string | null
  channelCode: string | null
  channelName: string | null
  isUploaded: boolean
  channelGroupId: string | null
  syncStatus: string | null
  productChannels: Array<{ masterSku: string | null; channelSku: string | null; variation: string | null }>
}

export interface UploadListingResult {
  items: UploadDestination[]
  meta: ApiPaginated<RawUploadListing>["meta"]
}

function mapDestination(raw: RawUploadListing): UploadDestination {
  return {
    itemGroupId: raw.item_group_id,
    itemGroupName: raw.item_group_name,
    storeId: raw.store_id,
    shopId: raw.shop_id,
    storeName: raw.store_name,
    channelId: raw.channel_id,
    channelCode: raw.channel_code,
    channelName: raw.channel_name,
    isUploaded: raw.is_uploaded,
    channelGroupId: raw.channel_group_id,
    syncStatus: raw.sync_status,
    productChannels: (raw.product_channels ?? []).map((p) => ({
      masterSku: p.master_sku,
      channelSku: p.channel_sku,
      variation: p.variation,
    })),
  }
}

export interface MatchRow {
  storeId: string
  channelGroupId: string | null
  message: string
  matched: boolean
}

interface RawMatchRow {
  store_id: string
  channel_group_id: string | null
  message: string
  matched: boolean
}

/* ── Tab Draft (global) ─────────────────────────────────────────────────── */

export interface DraftParams {
  search?: string
  status?: DraftStatus
  channel?: string
  page?: number
  perPage?: number
}

interface RawDraft {
  id: string
  item_group_id: string
  item_group_name: string | null
  thumbnail: string | null
  status: DraftStatus
  can_upload: boolean
  max: string | null
  channel_code: string | null
  channel_name: string | null
  store_id: string | null
  price_override: number | null
}

export interface DraftRow {
  id: string
  itemGroupId: string
  itemGroupName: string | null
  thumbnail: string | null
  status: DraftStatus
  canUpload: boolean
  storeName: string | null
  channelCode: string | null
  channelName: string | null
  storeId: string | null
  priceOverride: number | null
}

function mapDraft(raw: RawDraft): DraftRow {
  return {
    id: raw.id,
    itemGroupId: raw.item_group_id,
    itemGroupName: raw.item_group_name,
    thumbnail: raw.thumbnail,
    status: raw.status,
    canUpload: raw.can_upload,
    storeName: raw.max,
    channelCode: raw.channel_code,
    channelName: raw.channel_name,
    storeId: raw.store_id,
    priceOverride: raw.price_override,
  }
}

/* ── Tab Hasil (riwayat upload, global) ─────────────────────────────────── */

export interface HistoryParams {
  search?: string
  status?: string
  channel?: string
  shopId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
}

interface RawHistory {
  id: string
  item_group_id: string
  item_group_name: string | null
  thumbnail: string | null
  upload_date: string | null
  success: boolean
  status_message: string | null
  can_reupload: boolean
  max: string | null
  channel_code: string | null
  channel_name: string | null
  store_id: string | null
  channel_url: string | null
}

export interface HistoryRow {
  id: string
  itemGroupId: string
  itemGroupName: string | null
  thumbnail: string | null
  uploadDate: string | null
  success: boolean
  statusMessage: string | null
  canReupload: boolean
  storeName: string | null
  channelCode: string | null
  channelName: string | null
  storeId: string | null
  channelUrl: string | null
}

function mapHistory(raw: RawHistory): HistoryRow {
  return {
    id: raw.id,
    itemGroupId: raw.item_group_id,
    itemGroupName: raw.item_group_name,
    thumbnail: raw.thumbnail,
    uploadDate: raw.upload_date,
    success: raw.success,
    statusMessage: raw.status_message,
    canReupload: raw.can_reupload,
    storeName: raw.max,
    channelCode: raw.channel_code,
    channelName: raw.channel_name,
    storeId: raw.store_id,
    channelUrl: raw.channel_url,
  }
}

export interface BulkUploadResult {
  uploaded: number
  skipped: { id: string; reason: string }[]
}

/* ── Required Attributes (TikTok) ──────────────────────────────────────── */

interface RawRequiredAttributeOption {
  external_id: string
  name: string
}

interface RawRequiredAttribute {
  external_id: string
  name: string
  is_covered: boolean
  options: RawRequiredAttributeOption[]
}

interface RawRequiredAttributesData {
  channel_category_id: string | null
  attributes: RawRequiredAttribute[]
}

export interface RequiredAttributeOption {
  externalId: string
  name: string
}

export interface RequiredAttribute {
  externalId: string
  name: string
  isCovered: boolean
  options: RequiredAttributeOption[]
}

export interface RequiredAttributesResult {
  channelCategoryId: string | null
  attributes: RequiredAttribute[]
}

export const UploadService = {
  /* Toko tujuan untuk satu produk (Belum/Sudah Diupload). */
  listing: async (
    productId: string,
    params: UploadListingParams = {}
  ): Promise<UploadListingResult> => {
    const q = new URLSearchParams()
    q.set("is_uploaded", params.isUploaded ? "true" : "false")
    if (params.search) q.set("search", params.search)
    if (params.channel) q.set("filter[channel]", params.channel)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 25))

    const res = await fetchClient<ApiPaginated<RawUploadListing>>(
      `/products/${productId}/upload-listing?${q.toString()}`
    )
    return { items: (res.data ?? []).map(mapDestination), meta: res.meta }
  },

  /* Kecocokan data master untuk toko-toko terpilih (channel_shop UUID). */
  match: async (productId: string, storeIds: string[]): Promise<MatchRow[]> => {
    const res = await fetchClient<ApiResponse<RawMatchRow[]>>(
      `/products/${productId}/upload-listing/match`,
      { method: "POST", data: { store_ids: storeIds } }
    )
    return (res.data ?? []).map((r) => ({
      storeId: r.store_id,
      channelGroupId: r.channel_group_id,
      message: r.message,
      matched: r.matched,
    }))
  },

  /* Upsert draft (status ready) untuk produk↔toko (shop_id marketplace). */
  createDraft: async (productId: string, shopId: string): Promise<{ id: string }> => {
    const res = await fetchClient<ApiResponse<{ id: string }>>(
      `/products/${productId}/channel-drafts`,
      { method: "POST", data: { shop_id: shopId, status: "ready" } }
    )
    return res.data
  },

  bulkUpload: async (draftIds: string[]): Promise<BulkUploadResult> => {
    const res = await fetchClient<ApiResponse<BulkUploadResult>>(
      `/products/channel-drafts/bulk-upload`,
      { method: "POST", data: { ids: draftIds } }
    )
    return res.data
  },

  /* Aksi upload: buat draft per toko lalu antrekan upload. */
  uploadToStores: async (
    productId: string,
    shopIds: string[]
  ): Promise<BulkUploadResult> => {
    const drafts = await Promise.all(
      shopIds.map((shopId) => UploadService.createDraft(productId, shopId))
    )
    return UploadService.bulkUpload(drafts.map((d) => d.id))
  },

  /* Required attributes TikTok untuk product+store. */
  fetchRequiredAttributes: async (
    productId: string,
    shopId: string
  ): Promise<RequiredAttributesResult> => {
    const res = await fetchClient<ApiResponse<RawRequiredAttributesData>>(
      `/products/${productId}/channel-drafts/required-attributes?shop_id=${encodeURIComponent(shopId)}`
    )
    const raw = res.data
    return {
      channelCategoryId: raw.channel_category_id,
      attributes: (raw.attributes ?? []).map((a) => ({
        externalId: a.external_id,
        name: a.name,
        isCovered: a.is_covered,
        options: (a.options ?? []).map((o) => ({
          externalId: o.external_id,
          name: o.name,
        })),
      })),
    }
  },

  /* Buat draft dengan attribute_mapping lalu upload. */
  createDraftWithAttributes: async (
    productId: string,
    shopId: string,
    attributeMapping: Record<string, string> | null
  ): Promise<{ id: string }> => {
    const res = await fetchClient<ApiResponse<{ id: string }>>(
      `/products/${productId}/channel-drafts`,
      {
        method: "POST",
        data: {
          shop_id: shopId,
          status: "ready",
          ...(attributeMapping && Object.keys(attributeMapping).length > 0
            ? { attribute_mapping: attributeMapping }
            : {}),
        },
      }
    )
    return res.data
  },

  /* Upload dengan attribute mapping: buat draft per toko lalu antrekan. */
  uploadToStoresWithAttributes: async (
    productId: string,
    shopIds: string[],
    attributeMapping: Record<string, string> | null
  ): Promise<BulkUploadResult> => {
    const drafts = await Promise.all(
      shopIds.map((shopId) =>
        UploadService.createDraftWithAttributes(productId, shopId, attributeMapping)
      )
    )
    return UploadService.bulkUpload(drafts.map((d) => d.id))
  },

  /* Tab Draft (global). */
  drafts: async (params: DraftParams = {}): Promise<{ items: DraftRow[]; meta: ApiPaginated<RawDraft>["meta"] }> => {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    if (params.status) q.set("filter[status]", params.status)
    if (params.channel) q.set("filter[channel]", params.channel)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 25))

    const res = await fetchClient<ApiPaginated<RawDraft>>(
      `/products/channel-drafts?${q.toString()}`
    )
    return { items: (res.data ?? []).map(mapDraft), meta: res.meta }
  },

  deleteDraft: async (productId: string, draftId: string): Promise<void> => {
    await fetchClient(`/products/${productId}/channel-drafts/${draftId}`, { method: "DELETE" })
  },

  uploadDraft: async (draftId: string): Promise<void> => {
    await fetchClient(`/products/channel-drafts/${draftId}/upload`, { method: "POST" })
  },

  /* Tab Hasil (riwayat upload, global). */
  histories: async (params: HistoryParams = {}): Promise<{ items: HistoryRow[]; meta: ApiPaginated<RawHistory>["meta"] }> => {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    if (params.status) q.set("filter[status]", params.status)
    if (params.channel) q.set("filter[channel]", params.channel)
    if (params.shopId) q.set("filter[shop_id]", params.shopId)
    if (params.dateFrom) q.set("filter[date_from]", params.dateFrom)
    if (params.dateTo) q.set("filter[date_to]", params.dateTo)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 25))

    const res = await fetchClient<ApiPaginated<RawHistory>>(
      `/upload-histories?${q.toString()}`
    )
    return { items: (res.data ?? []).map(mapHistory), meta: res.meta }
  },

  reupload: async (id: string): Promise<void> => {
    await fetchClient(`/upload-histories/${id}/re-upload`, { method: "POST" })
  },

  bulkDeleteHistories: async (ids: string[]): Promise<void> => {
    await fetchClient(`/upload-histories/bulk-delete`, { method: "POST", data: { ids } })
  },
}
