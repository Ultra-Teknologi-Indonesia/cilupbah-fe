import type { PageMeta } from "./price"

export interface RawPriceAdjustment {
  id: string
  adjustment_no: string
  adjustment_date: string
  type: "online" | "offline"
  status: "draft" | "applied" | "cancelled"
  notes: string | null
  created_by: string | null
  applied_by: string | null
  applied_at: string | null
  items_count: number
  created_at: string
}

export interface PriceAdjustment {
  id: string
  adjustmentNo: string
  adjustmentDate: string
  type: "online" | "offline"
  status: "draft" | "applied" | "cancelled"
  notes: string | null
  createdBy: string | null
  appliedBy: string | null
  appliedAt: string | null
  itemsCount: number
  createdAt: string
}

export interface RawAdjustmentItem {
  id: string
  variant_id: string
  channel_shop_id: string | null
  location_id: string | null
  old_price: number
  new_price: number
  variant: {
    id: string
    product_id: string
    sku: string
    sell_price: number
    buy_price: number
    product: { id: string; name: string; thumbnail: string | null } | null
    options: { id: string; option_value: string }[]
  } | null
  channel_shop: {
    id: string
    shop_name: string
    channel: { id: string; name: string; code: string } | null
  } | null
  location: {
    id: string
    location_name: string
    is_pos: boolean
  } | null
}

export interface AdjustmentItem {
  id: string
  variantId: string
  channelShopId: string | null
  locationId: string | null
  oldPrice: number
  newPrice: number
  productName: string
  sku: string
  thumbnail: string | null
  variationValues: string[]
  targetName: string
}

export interface PriceAdjustmentDetail extends PriceAdjustment {
  items: AdjustmentItem[]
}

export interface AdjustmentListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  type?: string
}

export interface CreateAdjustmentPayload {
  adjustment_date: string
  type: "online" | "offline"
  notes?: string
  items: {
    variant_id: string
    channel_shop_id?: string
    location_id?: string
    new_price: number
  }[]
}
