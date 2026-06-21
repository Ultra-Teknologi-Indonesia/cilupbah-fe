

export type ProductStatus = "master" | "archived"

export interface ProductVariant {
  itemId: string
  sku: string
  sellPrice: number | null
  barcode: string | null
  taxRate: number | null
  variationValues: { label: string; value: string }[]
  storeNames: { storeName: string }[]
  
  stock?: { onHand: number; available: number }
}

export interface ProductChannelStatus {
  channelCode: string
  channelName: string
  storeName: string
  channelUrl: string | null
  errorText: string | null
}

export interface Product {
  itemGroupId: string
  itemName: string
  sku: string | null
  status: ProductStatus
  isPo: boolean
  isConsignment: boolean
  isBundle: boolean
  categoryName: string
  brandName: string
  sellPrice: number | null
  totalVariants: number
  lastModified: string
  thumbnail: string | null
  variations: { label: string; values: string[] }[]
  variants: ProductVariant[]
  onlineStatus: ProductChannelStatus[]
}


export interface RawMasterVariant {
  item_id: string
  item_code: string | null
  sell_price: number | null
  barcode: string | null
  tax_rate: number | null
  variation_values: { label: string; value: string }[]
  store_names: { store_name: string }[]
}

export interface RawMasterOnlineStatus {
  channel_code: string | null
  channel_name: string | null
  store_name: string | null
  channel_url: string | null
  error_text: string | null
}

export interface RawMasterItem {
  item_group_id: string
  sku: string | null
  status: ProductStatus
  is_po: boolean
  is_bundle: boolean
  is_consignment: boolean
  item_name: string
  last_modified: string
  sell_price: number | null
  category_name: string | null
  brand_name: string | null
  total_variants: number
  thumbnail: string | null
  variations: { label: string; values: string[] }[]
  variants: RawMasterVariant[]
  online_status: RawMasterOnlineStatus[]
}

