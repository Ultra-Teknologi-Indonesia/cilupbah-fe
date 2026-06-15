// Tipe domain produk untuk tampilan daftar Master Produk.

export type ProductStatus = "download" | "in_review" | "master" | "archived"

export interface ProductVariant {
  itemId: string
  sku: string
  sellPrice: number | null
  barcode: string | null
  taxRate: number | null
  variationValues: { label: string; value: string }[]
  storeNames: { storeName: string }[]
  stock: { onHand: number; available: number }
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
