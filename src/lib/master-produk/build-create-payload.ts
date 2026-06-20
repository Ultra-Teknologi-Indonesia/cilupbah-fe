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
  const hasVariants = values.variationTypes.length > 0

  const singleVariant: CreateVariantInput = {
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

  const typeNameById = new Map(values.variationTypes.map((t) => [t.attributeId, t.name]))

  const variants: CreateVariantInput[] = hasVariants
    ? values.variants.map((row) => ({
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
        options: row.options.map((o) =>
          o.attributeId < 0
            ? { name: typeNameById.get(o.attributeId) ?? "", value: o.value }
            : { attribute_id: o.attributeId, value: o.value }
        ),
      }))
    : [singleVariant]

  const specifications = values.specifications
    .filter((s) => (s.value ?? "").trim() !== "")
    .map((s) => ({ attribute_id: s.attributeId, text_value: (s.value ?? "").trim() }))

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
    weight_unit: values.weightUnit ?? "kg",
    length: num(values.length) ?? null,
    width: num(values.width) ?? null,
    height: num(values.height) ?? null,
    package_contents: values.packageContents?.trim() || null,
    ...(opts.media?.length ? { media: opts.media } : {}),
    ...(hasVariants
      ? {
          variation_types: values.variationTypes.map((t, i) =>
            t.attributeId < 0
              ? { name: t.name, sort_order: i }
              : { attribute_id: t.attributeId, sort_order: i }
          ),
        }
      : {}),
    ...(specifications.length ? { specifications } : {}),
    variants,
  }
}
