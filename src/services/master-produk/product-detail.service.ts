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
    images: (raw.images ?? []).map((i) => ({ url: i.url, isPrimary: i.is_primary })),
    priceRange: raw.price_range,
    channelsCount: raw.channels_count ?? null,
    category: raw.category,
    brand: raw.brand,
    isBundle: raw.is_bundle,
    productType:
      raw.product_type ??
      (raw.is_bundle ? "bundle" : (raw.variants?.length ?? 0) > 1 ? "variant" : "single"),
    totalVariants: raw.total_variants ?? raw.variants?.length ?? 0,
    bundleComponents: (raw.bundle_components ?? []).map((c) => ({
      componentVariantId: c.component_variant_id,
      qty: c.qty,
      sku: c.sku,
      product: c.product,
      variationValues: (c.variation_values ?? []).map((o) => ({
        attributeId: o.attribute_id,
        value: o.value,
      })),
      stock: c.stock
        ? {
            onHand: c.stock.on_hand,
            reserved: c.stock.reserved,
            onOrder: c.stock.on_order,
            available: c.stock.available,
          }
        : null,
    })),
    bundleStock: raw.bundle_stock
      ? {
          onHand: raw.bundle_stock.on_hand,
          reserved: raw.bundle_stock.reserved,
          onOrder: raw.bundle_stock.on_order,
          available: raw.bundle_stock.available,
        }
      : null,
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

export interface BulkResult {
  success: number
  failed: number
  errors: string[]
}

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

  delete: async (id: string): Promise<void> => {
    await fetchClient(`/products/${id}`, { method: "DELETE" })
  },

  bulkArchive: async (ids: string[], reason?: string): Promise<BulkResult> => {
    const res = await fetchClient<ApiResponse<BulkResult>>("/products/bulk-archive", {
      method: "POST",
      data: { ids, ...(reason ? { reason } : {}) },
    })
    return res.data
  },

  bulkRestore: async (ids: string[]): Promise<BulkResult> => {
    const res = await fetchClient<ApiResponse<BulkResult>>("/products/bulk-restore", {
      method: "POST",
      data: { ids },
    })
    return res.data
  },

  bulkDelete: async (ids: string[]): Promise<BulkResult> => {
    const res = await fetchClient<ApiResponse<BulkResult>>("/products/bulk-delete", {
      method: "POST",
      data: { ids },
    })
    return res.data
  },
}
