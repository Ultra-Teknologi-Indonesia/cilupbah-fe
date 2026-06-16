import type { BuatProdukFormValues, ProductDetail } from "@/types/master-produk"

const s = (n: number | null | undefined): string => (n == null ? "" : String(n))

/** ProductDetail → nilai awal form (prefill Edit). Varian diambil dari varian pertama. */
export function detailToFormValues(p: ProductDetail): BuatProdukFormValues {
  const variant = p.variants[0]

  return {
    name: p.name,
    sku: p.sku ?? variant?.sku ?? "",
    category: p.category
      ? { id: String(p.category.id), name: p.category.name, path: [p.category.name] }
      : null,
    brandId: p.brand ? String(p.brand.id) : null,
    brandOther: "",
    description: p.description ?? "",
    isBundle: p.isBundle,
    isConsignment: p.isConsignment,
    isPreorder: p.isPo,
    indentDays: s(p.indentDays),
    isStored: p.isStored,
    isSold: p.isSold,
    isPurchased: p.isPurchased,
    sellPrice: s(variant?.sellPrice ?? null),
    salesTaxId: variant?.salesTax ? String(variant.salesTax.id) : null,
    salesAccountId: p.accounts.sales?.id ?? null,
    salesReturnAccountId: p.accounts.salesReturn?.id ?? null,
    buyPrice: s(variant?.buyPrice ?? null),
    purchaseTaxId: variant?.purchaseTax ? String(variant.purchaseTax.id) : null,
    inventoryAccountId: p.accounts.inventory?.id ?? null,
    cogsAccountId: p.accounts.cogs?.id ?? null,
    purchaseLeadTime: s(p.purchaseLeadTime),
    minStock: s(variant?.minStock ?? null),
    safeStock: s(variant?.safeStock ?? null),
    unlimitedShopIds: [],
    weight: s(p.weight),
    length: s(p.length),
    width: s(p.width),
    height: s(p.height),
    packageContents: p.packageContents ?? "",
    // Edit varian/spesifikasi dinamis menyusul (butuh detail BE mengekspos opsi varian).
    variationTypes: [],
    variants: [],
    specifications: [],
  }
}
