import type { ProductStatus } from "./product"

export interface AccountRef {
  id: string
  code: string
  name: string
}

export interface DetailTax {
  id: number
  name: string
  rate: number
}

export interface DetailVariant {
  id: string
  sku: string
  barcode: string | null
  buyPrice: number | null
  sellPrice: number | null
  taxRate: number | null
  minStock: number | null
  safeStock: number | null
  isActive: boolean
  salesTax: DetailTax | null
  purchaseTax: DetailTax | null
  stock?: { onHand: number; reserved: number; onOrder: number; available: number }
}

export interface DetailChannelMapping {
  channelShopId: string | null
  shopName: string | null
  channelName: string | null
  externalProductId: string | null
  syncStatus: string | null
  lastSyncedAt: string | null
}

export interface ProductDetail {
  id: string
  name: string
  sku: string | null
  description: string | null
  status: ProductStatus
  isActive: boolean
  primaryImage: string | null
  priceRange: { min: number; max: number } | null
  channelsCount: number | null
  category: { id: number; name: string } | null
  brand: { id: number; name: string } | null
  isBundle: boolean
  isConsignment: boolean
  isStored: boolean
  isSold: boolean
  isPurchased: boolean
  orderType: string | null
  isPo: boolean
  indentDays: number | null
  purchaseLeadTime: number | null
  packageContents: string | null
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
  accounts: {
    sales: AccountRef | null
    salesReturn: AccountRef | null
    inventory: AccountRef | null
    cogs: AccountRef | null
  }
  channelMappings: DetailChannelMapping[]
  variants: DetailVariant[]
  verifiedAt: string | null
  archivedAt: string | null
  archiveReason: string | null
}

// ── DTO mentah dari GET /products/{id} (ProductResource) ──────────────
export interface RawProductDetail {
  id: string
  name: string
  sku: string | null
  description: string | null
  status: ProductStatus
  is_active: boolean
  primary_image: string | null
  price_range: { min: number; max: number } | null
  channels_count?: number
  category: { id: number; name: string } | null
  brand: { id: number; name: string } | null
  is_bundle: boolean
  is_consignment: boolean
  is_stored: boolean
  is_sold: boolean
  is_purchased: boolean
  order_type: string | null
  is_po: boolean
  indent_days: number | null
  purchase_lead_time: number | null
  package_contents: string | null
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
  accounts: {
    sales: AccountRef | null
    sales_return: AccountRef | null
    inventory: AccountRef | null
    cogs: AccountRef | null
  }
  channel_mappings?: Array<{
    channel_shop_id: string | null
    shop_name: string | null
    channel_name: string | null
    external_product_id: string | null
    sync_status: string | null
    last_synced_at: string | null
  }>
  variants?: Array<{
    id: string
    sku: string
    barcode: string | null
    buy_price: number | null
    sell_price: number | null
    tax_rate: number | null
    min_stock: number | null
    safe_stock: number | null
    is_active: boolean
    sales_tax: DetailTax | null
    purchase_tax: DetailTax | null
    stock?: { on_hand: number; reserved: number; on_order: number; available: number }
  }>
  verified_at: string | null
  archived_at: string | null
  archive_reason: string | null
}
