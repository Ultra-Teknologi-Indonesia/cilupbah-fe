export interface LocationStock {
  item_id: string
  location_id: string
  location_name: string
  on_hand: number
  on_order: number
  reserved: number
  available: number
}

export interface TotalStocks {
  on_hand: number
  on_order: number
  reserved: number
  available: number
}

export interface VariationValue {
  label: string
  value: string
}

export interface StockItem {
  item_id: string
  item_code: string
  item_name: string
  item_group_id: string
  is_bundle: boolean
  variation_values: VariationValue[]
  stock_this: boolean
  average_cost: string | number
  location_stocks: LocationStock[]
  total_stocks: TotalStocks
  thumbnail: string | null
}

export interface StockMovement {
  id: string
  item_id: string
  sku: string | null
  product_id: string | null
  location_id: string
  location_name: string
  bin_id: string | null
  bin_code: string | null
  transaction_number: string
  source: string
  source_category: string
  source_label: string
  direction: "in" | "out" | "none"
  qty: number
  balance: number
  transaction_date: string
  created_by: string
  created_at: string
}

export interface BinInventory {
  id: string
  item_id: string
  location_id: string
  location_name: string
  bin_id: string | null
  bin_code: string | null
  batch_no: string | null
  serial_no: string | null
  expired_date: string | null
  on_hand: number
  on_order: number
  reserved: number
  available: number
  avg_cost: number
}

export interface StockListParams {
  search?: string
  page?: number
  per_page?: number
  "filter[product_id]"?: string
  "filter[location_id]"?: string
  "filter[is_bundle]"?: string
  "filter[channel]"?: string
  sort?: string
}

export interface StockMovementParams {
  page?: number
  per_page?: number
  "filter[item_id]"?: string
  "filter[location_id]"?: string
  "filter[source]"?: string
  "filter[direction]"?: "in" | "out"
  "filter[date_from]"?: string
  "filter[date_to]"?: string
  sort?: string
}

export interface StockChannel {
  channel_id: string
  channel_code: string
  channel_name: string
  store_name: string
  store_id: string
}

export interface StockLocation {
  location_id: string
  location_name: string
}

export interface StockListMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  channels: StockChannel[]
  locations: StockLocation[]
}
