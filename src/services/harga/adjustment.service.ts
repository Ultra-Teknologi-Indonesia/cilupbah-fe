import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"
import type {
  RawPriceAdjustment,
  PriceAdjustment,
  RawAdjustmentItem,
  AdjustmentItem,
  PriceAdjustmentDetail,
  AdjustmentListParams,
  CreateAdjustmentPayload,
} from "@/types/harga/adjustment"

function mapAdjustment(r: RawPriceAdjustment): PriceAdjustment {
  return {
    id: r.id,
    adjustmentNo: r.adjustment_no,
    adjustmentDate: r.adjustment_date,
    type: r.type,
    status: r.status,
    notes: r.notes,
    createdBy: r.created_by,
    appliedBy: r.applied_by,
    appliedAt: r.applied_at,
    itemsCount: r.items_count,
    createdAt: r.created_at,
  }
}

function mapItem(r: RawAdjustmentItem): AdjustmentItem {
  const v = r.variant
  let targetName = "Harga Default"
  if (r.channel_shop) {
    targetName = `${r.channel_shop.shop_name}${r.channel_shop.channel ? ` (${r.channel_shop.channel.name})` : ""}`
  } else if (r.location) {
    targetName = r.location.location_name
  }

  return {
    id: r.id,
    variantId: r.variant_id,
    channelShopId: r.channel_shop_id,
    locationId: r.location_id,
    oldPrice: r.old_price,
    newPrice: r.new_price,
    productName: v?.product?.name ?? "",
    sku: v?.sku ?? "",
    thumbnail: v?.product?.thumbnail ?? null,
    variationValues: v?.options?.map((o) => o.option_value) ?? [],
    targetName,
  }
}

function buildQuery(params: object): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
  }
  return q.toString()
}

export const AdjustmentService = {
  list: async (
    params: AdjustmentListParams = {}
  ): Promise<{ items: PriceAdjustment[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }> => {
    const res = await fetchClient<ApiPaginated<RawPriceAdjustment>>(
      `/prices/adjustments?${buildQuery(params)}`
    )
    return {
      items: (res.data ?? []).map(mapAdjustment),
      meta: res.meta,
    }
  },

  show: async (id: string): Promise<PriceAdjustmentDetail> => {
    const res = await fetchClient<ApiResponse<RawPriceAdjustment & { items: RawAdjustmentItem[] }>>(
      `/prices/adjustments/${id}`
    )
    const raw = res.data
    return {
      ...mapAdjustment(raw),
      items: (raw.items ?? []).map(mapItem),
    }
  },

  create: async (payload: CreateAdjustmentPayload): Promise<PriceAdjustment> => {
    const res = await fetchClient<ApiResponse<RawPriceAdjustment>>(
      "/prices/adjustments",
      { method: "POST", data: payload }
    )
    return mapAdjustment(res.data)
  },

  apply: async (id: string): Promise<void> => {
    await fetchClient<ApiResponse<unknown>>(
      `/prices/adjustments/${id}/apply`,
      { method: "POST" }
    )
  },

  cancel: async (id: string): Promise<void> => {
    await fetchClient<ApiResponse<unknown>>(
      `/prices/adjustments/${id}/cancel`,
      { method: "POST" }
    )
  },

  destroy: async (id: string): Promise<void> => {
    await fetchClient<ApiResponse<unknown>>(
      `/prices/adjustments/${id}`,
      { method: "DELETE" }
    )
  },
}
