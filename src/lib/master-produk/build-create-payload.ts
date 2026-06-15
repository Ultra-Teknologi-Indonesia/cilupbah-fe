import type {
  BuatProdukFormValues,
  CreateMediaInput,
  CreateProductPayload,
  CreateVariantInput,
  ProductCreateStatus,
} from "@/types/master-produk"

function num(value?: string | null): number | undefined {
  if (value == null) return undefined
  const trimmed = String(value).trim()
  if (!trimmed) return undefined
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : undefined
}

export function buildCreatePayload(
  values: BuatProdukFormValues,
  opts: { status: ProductCreateStatus; media?: CreateMediaInput[] }
): CreateProductPayload {
  const sku = values.sku.trim()

  const variant: CreateVariantInput = {
    sku,
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

  return {
    name: values.name.trim(),
    sku: sku || null,
    category_id: Number(values.category!.id),
    brand_id: values.brandId ? Number(values.brandId) : null,
    description: values.description?.trim() || null,
    is_bundle: values.isBundle,
    is_consignment: values.isConsignment,
    order_type: values.isPreorder ? "PREORDER" : "REGULER",
    ...(values.isPreorder ? { indent_days: num(values.indentDays) ?? 0 } : {}),
    status: opts.status,
    is_stored: values.isStored,
    is_sold: values.isSold,
    is_purchased: values.isPurchased,
    purchase_lead_time: num(values.purchaseLeadTime) ?? null,
    sales_account_id: values.salesAccountId,
    sales_return_account_id: values.salesReturnAccountId,
    inventory_account_id: values.inventoryAccountId,
    cogs_account_id: values.cogsAccountId,
    weight: num(values.weight) ?? null,
    length: num(values.length) ?? null,
    width: num(values.width) ?? null,
    height: num(values.height) ?? null,
    package_contents: values.packageContents?.trim() || null,
    ...(opts.media?.length ? { media: opts.media } : {}),
    variants: [variant],
  }
}
