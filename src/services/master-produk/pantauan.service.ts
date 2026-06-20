import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"

export type PantauanLens = "belum_upload" | "harga" | "sku" | "atribut" | "persyaratan" | "direview" | "ditolak"
export type ProductTypeFilter = "satuan" | "bundle" | "konsinyasi"

export interface PantauanParams {
  lens?: PantauanLens
  search?: string
  categoryId?: number | string
  channel?: string
  type?: ProductTypeFilter
  page?: number
  perPage?: number
}

interface RawReviewChannel {
  channel_code: string | null
  shop_name: string | null
  sync_status: string | null
  error_message: string | null
  reviewed_at: string | null
}

export interface ReviewChannel {
  channelCode: string | null
  shopName: string | null
  syncStatus: string | null
  errorMessage: string | null
  reviewedAt: string | null
}

interface RawPantauan {
  product_id: string
  product_name: string
  sku: string | null
  primary_image: string | null
  category_name: string | null
  product_type: string
  not_uploaded_count: number | null
  requirements_summary: string | null
  review_channels?: RawReviewChannel[]
}

export interface PantauanProduct {
  productId: string
  productName: string
  sku: string | null
  primaryImage: string | null
  categoryName: string | null
  productType: string
  notUploadedCount: number | null
  requirementsSummary: string | null
  reviewChannels: ReviewChannel[]
}

function mapItem(raw: RawPantauan): PantauanProduct {
  return {
    productId: raw.product_id,
    productName: raw.product_name,
    sku: raw.sku,
    primaryImage: raw.primary_image,
    categoryName: raw.category_name,
    productType: raw.product_type,
    notUploadedCount: raw.not_uploaded_count,
    requirementsSummary: raw.requirements_summary,
    reviewChannels: (raw.review_channels ?? []).map((rc) => ({
      channelCode: rc.channel_code,
      shopName: rc.shop_name,
      syncStatus: rc.sync_status,
      errorMessage: rc.error_message,
      reviewedAt: rc.reviewed_at,
    })),
  }
}

export const PantauanService = {
  list: async (
    params: PantauanParams = {}
  ): Promise<{ items: PantauanProduct[]; meta: ApiPaginated<RawPantauan>["meta"] }> => {
    const q = new URLSearchParams()
    q.set("lens", params.lens ?? "belum_upload")
    if (params.search) q.set("search", params.search)
    if (params.categoryId) q.set("filter[category_id]", String(params.categoryId))
    if (params.channel) q.set("filter[channel]", params.channel)
    if (params.type) q.set("filter[type]", params.type)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 25))

    const res = await fetchClient<ApiPaginated<RawPantauan>>(`/products/pantauan?${q.toString()}`)
    return { items: (res.data ?? []).map(mapItem), meta: res.meta }
  },

  /** Antrekan rekonsiliasi data channel (non-destruktif) untuk semua toko aktif. */
  refresh: async (): Promise<{ queued: number; skippedChannels: string[] }> => {
    const res = await fetchClient<ApiResponse<{ queued: number; skipped_channels: string[] }>>(
      `/channel-monitor/refresh`,
      { method: "POST" }
    )
    return { queued: res.data?.queued ?? 0, skippedChannels: res.data?.skipped_channels ?? [] }
  },
}
