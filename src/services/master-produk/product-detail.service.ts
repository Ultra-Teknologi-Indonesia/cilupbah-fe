import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"
import type { ProductDetail, RawProductDetail } from "@/types/master-produk"

function mapDetail(raw: RawProductDetail): ProductDetail {
  return {
    id: raw.id,
    name: raw.name,
    sku: raw.sku,
    description: raw.description,
    status: raw.status,
    isActive: raw.is_active,
    primaryImage: raw.primary_image,
    priceRange: raw.price_range,
    channelsCount: raw.channels_count ?? null,
    category: raw.category,
    brand: raw.brand,
    isBundle: raw.is_bundle,
    isConsignment: raw.is_consignment,
    isStored: raw.is_stored,
    isSold: raw.is_sold,
    isPurchased: raw.is_purchased,
    orderType: raw.order_type,
    isPo: raw.is_po,
    indentDays: raw.indent_days,
    purchaseLeadTime: raw.purchase_lead_time,
    packageContents: raw.package_contents,
    weight: raw.weight,
    length: raw.length,
    width: raw.width,
    height: raw.height,
    accounts: {
      sales: raw.accounts.sales,
      salesReturn: raw.accounts.sales_return,
      inventory: raw.accounts.inventory,
      cogs: raw.accounts.cogs,
    },
    channelMappings: (raw.channel_mappings ?? []).map((m) => ({
      channelShopId: m.channel_shop_id,
      shopName: m.shop_name,
      channelName: m.channel_name,
      externalProductId: m.external_product_id,
      syncStatus: m.sync_status,
      lastSyncedAt: m.last_synced_at,
    })),
    variationTypes: (raw.variation_types ?? []).map((t) => ({
      attributeId: t.attribute_id,
      name: t.name,
      sortOrder: t.sort_order,
    })),
    variants: (raw.variants ?? []).map((v) => ({
      id: v.id,
      sku: v.sku,
      barcode: v.barcode,
      buyPrice: v.buy_price,
      sellPrice: v.sell_price,
      taxRate: v.tax_rate,
      minStock: v.min_stock,
      safeStock: v.safe_stock,
      isActive: v.is_active,
      salesTax: v.sales_tax,
      purchaseTax: v.purchase_tax,
      options: (v.options ?? []).map((o) => ({
        attributeId: o.attribute_id,
        value: o.value,
      })),
      stock: v.stock
        ? {
            onHand: v.stock.on_hand,
            reserved: v.stock.reserved,
            onOrder: v.stock.on_order,
            available: v.stock.available,
          }
        : undefined,
    })),
    verifiedAt: raw.verified_at,
    archivedAt: raw.archived_at,
    archiveReason: raw.archive_reason,
  }
}

export type LifecycleAction =
  | "submit-review"
  | "approve"
  | "reject"
  | "archive"
  | "restore"

export const ProductDetailService = {
  get: async (id: string): Promise<ProductDetail> => {
    const res = await fetchClient<ApiResponse<RawProductDetail>>(`/products/${id}`)
    return mapDetail(res.data)
  },

  lifecycle: async (
    id: string,
    action: LifecycleAction,
    payload?: { reason?: string }
  ): Promise<void> => {
    await fetchClient(`/products/${id}/${action}`, {
      method: "POST",
      data: payload,
    })
  },
}
