import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"

// ─── Raw (snake_case from BE) ───

interface RawStore {
  raiseproduct_id: string
  store_id: string
  channel_id: string | null
  channel_code: string | null
  channel_name: string | null
  store_name: string | null
  product_active: number
  is_active: boolean
}

interface RawDetail {
  raiseproduct_detail_id: string
  raiseproduct_id: string
  item_group_name: string | null
  channel_group_id: string | null
  channel_url: string | null
  item_id: string[]
  item_codes: string[]
  thumbnails: (string | null)[]
  is_active: boolean
  is_repeatable: boolean
  is_success: boolean | null
  start_time: string | null
  end_time: string | null
  reason: string | null
}

// ─── Mapped (camelCase for FE) ───

export interface RaiseProductStore {
  raiseproductId: string
  storeId: string
  channelId: string | null
  channelCode: string | null
  channelName: string | null
  storeName: string | null
  productActive: number
  isActive: boolean
}

export interface RaiseProductDetail {
  raiseproductDetailId: string
  raiseproductId: string
  itemGroupName: string | null
  channelGroupId: string | null
  channelUrl: string | null
  itemId: string[]
  itemCodes: string[]
  thumbnails: (string | null)[]
  isActive: boolean
  isRepeatable: boolean
  isSuccess: boolean | null
  startTime: string | null
  endTime: string | null
  reason: string | null
}

// ─── Mappers ───

function mapStore(raw: RawStore): RaiseProductStore {
  return {
    raiseproductId: raw.raiseproduct_id,
    storeId: raw.store_id,
    channelId: raw.channel_id,
    channelCode: raw.channel_code,
    channelName: raw.channel_name,
    storeName: raw.store_name,
    productActive: raw.product_active,
    isActive: raw.is_active,
  }
}

function mapDetail(raw: RawDetail): RaiseProductDetail {
  return {
    raiseproductDetailId: raw.raiseproduct_detail_id,
    raiseproductId: raw.raiseproduct_id,
    itemGroupName: raw.item_group_name,
    channelGroupId: raw.channel_group_id,
    channelUrl: raw.channel_url,
    itemId: raw.item_id,
    itemCodes: raw.item_codes,
    thumbnails: raw.thumbnails,
    isActive: raw.is_active,
    isRepeatable: raw.is_repeatable,
    isSuccess: raw.is_success,
    startTime: raw.start_time,
    endTime: raw.end_time,
    reason: raw.reason,
  }
}

// ─── Params ───

export interface NaikkanListParams {
  search?: string
  channel?: string
  page?: number
  perPage?: number
}

export interface NaikkanDetailParams {
  search?: string
  filterIsActive?: boolean
  filterIsSuccess?: boolean
  page?: number
  perPage?: number
}

export interface NaikkanHistoryParams {
  search?: string
  page?: number
  perPage?: number
}

// ─── Service ───

export const NaikkanService = {
  list: async (params: NaikkanListParams = {}) => {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    if (params.channel) q.set("filter[channel]", params.channel)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 25))

    const res = await fetchClient<ApiPaginated<RawStore>>(`/raise-products?${q}`)
    return { items: (res.data ?? []).map(mapStore), meta: res.meta }
  },

  detail: async (id: string, params: NaikkanDetailParams = {}) => {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    if (params.filterIsActive !== undefined) q.set("filter[is_active]", String(params.filterIsActive))
    if (params.filterIsSuccess !== undefined) q.set("filter[is_success]", String(params.filterIsSuccess))
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 25))

    const res = await fetchClient<ApiResponse<RawStore & { details: RawDetail[] }> & { meta?: ApiPaginated<unknown>["meta"] }>(
      `/raise-products/${id}?${q}`
    )
    const raw = res.data
    return {
      store: mapStore(raw),
      details: (raw.details ?? []).map(mapDetail),
      meta: res.meta ?? { current_page: 1, last_page: 1, per_page: 25, total: 0 },
    }
  },

  history: async (id: string, params: NaikkanHistoryParams = {}) => {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 25))

    const res = await fetchClient<ApiPaginated<RawDetail>>(`/raise-products/${id}/history?${q}`)
    return { items: (res.data ?? []).map(mapDetail), meta: res.meta }
  },

  create: async (shopId: string) => {
    const res = await fetchClient<ApiResponse<RawStore>>("/raise-products", {
      method: "POST",
      data: { shop_id: shopId },
    })
    return mapStore(res.data)
  },

  addProduct: async (raiseProductId: string, mappingId: string) => {
    const res = await fetchClient<ApiResponse<RawDetail>>(
      `/raise-products/${raiseProductId}/products`,
      { method: "POST", data: { product_channel_mapping_id: mappingId } }
    )
    return mapDetail(res.data)
  },

  updateProduct: async (
    raiseProductId: string,
    detailId: string,
    data: { is_active?: boolean; is_repeatable?: boolean }
  ) => {
    const res = await fetchClient<ApiResponse<RawDetail>>(
      `/raise-products/${raiseProductId}/products/${detailId}`,
      { method: "PATCH", data }
    )
    return mapDetail(res.data)
  },

  removeProduct: async (raiseProductId: string, detailId: string) => {
    await fetchClient(`/raise-products/${raiseProductId}/products/${detailId}`, {
      method: "DELETE",
    })
  },

  raise: async (raiseProductId: string, detailIds?: string[]) => {
    const res = await fetchClient<ApiResponse<RawStore>>(
      `/raise-products/${raiseProductId}/raise`,
      { method: "POST", data: detailIds ? { detail_ids: detailIds } : {} }
    )
    return mapStore(res.data)
  },

  destroy: async (raiseProductId: string) => {
    await fetchClient(`/raise-products/${raiseProductId}`, { method: "DELETE" })
  },
}
