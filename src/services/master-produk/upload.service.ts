import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"

export type ProductType = "single" | "variant" | "bundle"
export type DraftStatus = "draft" | "ready" | "cancelled"

export interface UploadableParams {
  
  shopId: string
  search?: string
  
  sort?: string
  page?: number
  perPage?: number
}


interface RawUploadable {
  id: string
  name: string
  sku: string | null
  status: string
  primary_image: string | null
  price_range: { min: number | null; max: number | null } | null
  category: { id: string; name: string } | null
  brand: { id: string; name: string } | null
  product_type: ProductType
  total_variants: number
  is_bundle: boolean
}

export interface UploadableProduct {
  id: string
  name: string
  sku: string | null
  status: string
  image: string | null
  priceMin: number | null
  priceMax: number | null
  categoryName: string
  brandName: string
  productType: ProductType
  totalVariants: number
  isBundle: boolean
}

export interface UploadableResult {
  items: UploadableProduct[]
  meta: ApiPaginated<RawUploadable>["meta"]
}


interface RawDraft {
  id: string
  item_group_id: string
  item_group_name: string
  thumbnail: string | null
  status: DraftStatus
  can_upload: boolean
  channel_code: string | null
  channel_name: string | null
  store_id: string | null
  channel_category_id: string | null
  price_override: number | null
}

export interface ChannelDraft {
  id: string
  productId: string
  productName: string
  thumbnail: string | null
  status: DraftStatus
  canUpload: boolean
  channelCode: string | null
  channelName: string | null
  storeId: string | null
  channelCategoryId: string | null
  priceOverride: number | null
}

export interface CreateDraftInput {
  
  shopId: string
  channelCategoryId?: string | null
  attributeMapping?: Record<string, unknown> | null
  priceOverride?: number | null
  status?: DraftStatus
}

export type UpdateDraftInput = Omit<CreateDraftInput, "shopId">

export interface BulkUploadResult {
  uploaded: number
  skipped: { id: string; reason: string }[]
}

function mapUploadable(raw: RawUploadable): UploadableProduct {
  return {
    id: raw.id,
    name: raw.name,
    sku: raw.sku ?? null,
    status: raw.status,
    image: raw.primary_image ?? null,
    priceMin: raw.price_range?.min ?? null,
    priceMax: raw.price_range?.max ?? null,
    categoryName: raw.category?.name ?? "—",
    brandName: raw.brand?.name ?? "—",
    productType: raw.product_type,
    totalVariants: raw.total_variants,
    isBundle: raw.is_bundle,
  }
}

function mapDraft(raw: RawDraft): ChannelDraft {
  return {
    id: raw.id,
    productId: raw.item_group_id,
    productName: raw.item_group_name,
    thumbnail: raw.thumbnail ?? null,
    status: raw.status,
    canUpload: raw.can_upload,
    channelCode: raw.channel_code ?? null,
    channelName: raw.channel_name ?? null,
    storeId: raw.store_id ?? null,
    channelCategoryId: raw.channel_category_id ?? null,
    priceOverride: raw.price_override ?? null,
  }
}

function draftBody(input: CreateDraftInput | UpdateDraftInput) {
  const body: Record<string, unknown> = {}
  if ("shopId" in input && input.shopId) body.shop_id = input.shopId
  if (input.channelCategoryId !== undefined) body.channel_category_id = input.channelCategoryId
  if (input.attributeMapping !== undefined) body.attribute_mapping = input.attributeMapping
  if (input.priceOverride !== undefined) body.price_override = input.priceOverride
  if (input.status !== undefined) body.status = input.status
  return body
}

export const UploadService = {
  
  uploadable: async (params: UploadableParams): Promise<UploadableResult> => {
    const q = new URLSearchParams()
    q.set("shop_id", params.shopId)
    if (params.search) q.set("search", params.search)
    if (params.sort) q.set("sort", params.sort)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 20))

    const res = await fetchClient<ApiPaginated<RawUploadable>>(
      `/products/uploadable?${q.toString()}`
    )
    return { items: (res.data ?? []).map(mapUploadable), meta: res.meta }
  },

  
  drafts: async (productId: string): Promise<ChannelDraft[]> => {
    const res = await fetchClient<ApiResponse<RawDraft[]>>(
      `/products/${productId}/channel-drafts`
    )
    return (res.data ?? []).map(mapDraft)
  },

  
  createDraft: async (
    productId: string,
    input: CreateDraftInput
  ): Promise<ChannelDraft> => {
    const res = await fetchClient<ApiResponse<RawDraft>>(
      `/products/${productId}/channel-drafts`,
      { method: "POST", data: draftBody(input) }
    )
    return mapDraft(res.data)
  },

  updateDraft: async (
    productId: string,
    draftId: string,
    input: UpdateDraftInput
  ): Promise<ChannelDraft> => {
    const res = await fetchClient<ApiResponse<RawDraft>>(
      `/products/${productId}/channel-drafts/${draftId}`,
      { method: "PUT", data: draftBody(input) }
    )
    return mapDraft(res.data)
  },

  deleteDraft: async (productId: string, draftId: string): Promise<void> => {
    await fetchClient(`/products/${productId}/channel-drafts/${draftId}`, {
      method: "DELETE",
    })
  },

  
  uploadDraft: async (draftId: string): Promise<void> => {
    await fetchClient(`/products/channel-drafts/${draftId}/upload`, {
      method: "POST",
    })
  },

  
  bulkUpload: async (draftIds: string[]): Promise<BulkUploadResult> => {
    const res = await fetchClient<ApiResponse<BulkUploadResult>>(
      `/products/channel-drafts/bulk-upload`,
      { method: "POST", data: { ids: draftIds } }
    )
    return res.data
  },

  
  uploadProductsToShop: async (
    productIds: string[],
    shopId: string
  ): Promise<BulkUploadResult> => {
    const drafts = await Promise.all(
      productIds.map((id) =>
        UploadService.createDraft(id, { shopId, status: "ready" })
      )
    )
    return UploadService.bulkUpload(drafts.map((d) => d.id))
  },
}
