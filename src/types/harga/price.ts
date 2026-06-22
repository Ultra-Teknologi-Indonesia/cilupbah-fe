export interface ChannelHeader {
  channel_shop_id: string
  channel_name: string
  channel_code: string
  store_name: string
}

export interface ChannelPrice {
  channel_shop_id: string
  store_name: string
  channel_code: string
  price: number
  sell_here: boolean
}

export interface RawOnlinePriceRow {
  variant_id: string
  product_id: string
  product_name: string
  sku: string
  thumbnail: string | null
  variation_values: string[]
  sell_price: number
  buy_price: number
  prices: ChannelPrice[]
}

export interface OnlinePriceRow {
  variantId: string
  productId: string
  productName: string
  sku: string
  thumbnail: string | null
  variationValues: string[]
  sellPrice: number
  buyPrice: number
  prices: ChannelPrice[]
}

export interface OnlinePriceResponse {
  status: string
  channels: ChannelHeader[]
  data: RawOnlinePriceRow[]
  meta: PageMeta
}

export interface LocationHeader {
  location_id: string
  location_name: string
  is_pos_outlet: boolean
}

export interface LocationPrice {
  location_id: string
  location_name: string
  price: number
  is_active: boolean
}

export interface RawOfflinePriceRow {
  variant_id: string
  product_id: string
  product_name: string
  sku: string
  thumbnail: string | null
  variation_values: string[]
  sell_price: number
  buy_price: number
  price_by_location: LocationPrice[]
}

export interface OfflinePriceRow {
  variantId: string
  productId: string
  productName: string
  sku: string
  thumbnail: string | null
  variationValues: string[]
  sellPrice: number
  buyPrice: number
  priceByLocation: LocationPrice[]
}

export interface OfflinePriceResponse {
  status: string
  locations: LocationHeader[]
  data: RawOfflinePriceRow[]
  meta: PageMeta
}

export interface PageMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PriceListParams {
  page?: number
  per_page?: number
  search?: string
  sort?: string
  direction?: "asc" | "desc"
}

export interface OnlinePriceListParams extends PriceListParams {
  channel_shop_id?: string
}

export interface OfflinePriceListParams extends PriceListParams {
  location_id?: string
}

export interface UpdateOnlinePriceItem {
  variant_id: string
  channel_shop_id: string
  price: number
}

export interface UpdateOfflinePriceItem {
  variant_id: string
  location_id: string
  price: number
  is_active?: boolean
}
