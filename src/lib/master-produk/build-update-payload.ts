import type {
  BuatProdukFormValues,
  CreateMediaInput,
  CreateVariantInput,
  ProductUpdatePayload,
} from "@/types/master-produk"

function num(value?: string | null): number | undefined {
  if (value == null) return undefined
  const trimmed = String(value).trim()
  if (!trimmed) return undefined
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : undefined
}

export interface VariantMediaEntry {
  variantKey: string
  mediaUuid: string
}

export function buildUpdatePayload(
  values: BuatProdukFormValues,
  opts: {
    includeVariant: boolean
    originalVariantSku?: string
    media?: CreateMediaInput[]
    variantMedia?: VariantMediaEntry[]
  }
): ProductUpdatePayload {
  const payload: ProductUpdatePayload = {
    name: values.name.trim(),
    sku: values.sku.trim() || null,
    category_id: Number(values.category!.id),
    brand_id: values.brandId ? Number(values.brandId) : null,
    description: values.description?.trim() || null,
    is_bundle: values.isBundle,
    is_consignment: values.isConsignment,
    order_type: values.isPreorder ? "PREORDER" : "REGULER",
    ...(values.isPreorder ? { indent_days: num(values.indentDays) ?? 0 } : {}),
    is_stored: values.isStored,
    is_sold: values.isSold,
    is_purchased: values.isPurchased,
    purchase_lead_time: num(values.purchaseLeadTime) ?? null,
    sales_account_id: values.salesAccountId,
    sales_return_account_id: values.salesReturnAccountId,
    inventory_account_id: values.inventoryAccountId,
    cogs_account_id: values.cogsAccountId,
    weight: num(values.weight) ?? null,
    weight_unit: values.weightUnit ?? "kg",
    length: num(values.length) ?? null,
    width: num(values.width) ?? null,
    height: num(values.height) ?? null,
    package_contents: values.packageContents?.trim() || null,
  }

  const specifications = values.specifications
    .filter((s) => (s.value ?? "").trim() !== "")
    .map((s) => ({ attribute_id: s.attributeId, text_value: (s.value ?? "").trim() }))
  if (specifications.length) {
    payload.specifications = specifications
  }

  if (values.variationTypes.length > 0) {
    
    payload.variation_types = values.variationTypes.map((t, i) => ({
      attribute_id: t.attributeId,
      sort_order: i,
    }))
    payload.variants = values.variants.map((row) => {
      const v: CreateVariantInput = {
        sku: row.sku.trim(),
        barcode: row.barcode?.trim() || null,
        sell_price: num(row.sellPrice) ?? num(values.sellPrice) ?? 0,
        buy_price: num(row.buyPrice) ?? null,
        weight: num(row.weight) ?? null,
        length: num(row.length) ?? null,
        width: num(row.width) ?? null,
        height: num(row.height) ?? null,
        sales_tax_id: values.salesTaxId ? Number(values.salesTaxId) : null,
        purchase_tax_id: values.purchaseTaxId ? Number(values.purchaseTaxId) : null,
        is_active: true,
        options: row.options.map((o) => ({ attribute_id: o.attributeId, value: o.value })),
      }
      const vm = opts.variantMedia?.find((m) => m.variantKey === row.key)
      if (vm) {
        v.media = [{ media_uuid: vm.mediaUuid, media_type: "image", is_primary: true, sort_order: 0 }]
      }
      return v
    })
  } else if (opts.includeVariant) {
    const variant: CreateVariantInput = {
      sku: opts.originalVariantSku ?? values.sku.trim(),
      sell_price: num(values.sellPrice) ?? 0,
      buy_price: num(values.buyPrice) ?? null,
      sales_tax_id: values.salesTaxId ? Number(values.salesTaxId) : null,
      purchase_tax_id: values.purchaseTaxId ? Number(values.purchaseTaxId) : null,
      min_stock: num(values.minStock) ?? null,
      safe_stock: num(values.safeStock) ?? null,
      is_active: true,
      ...(values.unlimitedShopIds.length
        ? { unlimited_shop_ids: values.unlimitedShopIds }
        : {}),
    }
    payload.variants = [variant]
  }

  // Selalu kirim media bila editor menyediakannya (termasuk array kosong),
  // agar penghapusan semua gambar tersimpan.
  if (opts.media !== undefined) {
    payload.media = opts.media
  }

  return payload
}
