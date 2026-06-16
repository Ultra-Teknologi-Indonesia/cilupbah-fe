import type { BuatProdukFormValues, ProductDetail } from "@/types/master-produk"
import { buildCombos, comboKey, comboLabel } from "./variant-combos"

const s = (n: number | null | undefined): string => (n == null ? "" : String(n))

/** Rekonstruksi jenis varian + kombinasi dari detail (untuk hidrasi builder edit). */
function reconstructVariants(p: ProductDetail) {
  const active = p.variants.filter((v) => v.isActive)
  const types = [...p.variationTypes].sort((a, b) => a.sortOrder - b.sortOrder)

  const valuesByType = new Map<number, string[]>()
  for (const t of types) valuesByType.set(t.attributeId, [])
  for (const v of active) {
    for (const o of v.options) {
      const arr = valuesByType.get(o.attributeId)
      if (arr && !arr.some((x) => x.toLowerCase() === o.value.toLowerCase())) arr.push(o.value)
    }
  }

  const variationTypes = types.map((t) => ({
    attributeId: t.attributeId,
    name: t.name ?? "",
    values: valuesByType.get(t.attributeId) ?? [],
  }))

  const variants = buildCombos(variationTypes).map((opts) => {
    const match = active.find((v) => {
      const m = new Map(v.options.map((o) => [o.attributeId, o.value.toLowerCase()]))
      return m.size === opts.length && opts.every((o) => m.get(o.attributeId) === o.value.toLowerCase())
    })
    return {
      key: comboKey(opts),
      label: comboLabel(opts),
      options: opts,
      sku: match?.sku ?? "",
      sellPrice: match?.sellPrice != null ? String(match.sellPrice) : "",
    }
  })

  return { variationTypes, variants }
}

/** Jenis & nilai opsi yang sudah tersimpan → tak boleh dihapus saat edit (immutability). */
export function detailVariantLocks(p: ProductDetail): {
  lockedTypeIds: number[]
  lockedValues: Record<number, string[]>
} {
  const { variationTypes } = reconstructVariants(p)
  return {
    lockedTypeIds: variationTypes.map((t) => t.attributeId),
    lockedValues: Object.fromEntries(variationTypes.map((t) => [t.attributeId, t.values])),
  }
}

/** ProductDetail → nilai awal form (prefill Edit). */
export function detailToFormValues(p: ProductDetail): BuatProdukFormValues {
  const variant = p.variants[0]
  const { variationTypes, variants } = reconstructVariants(p)

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
    variationTypes,
    variants,
    // Spesifikasi belum dihidrasi (detail belum mengekspos) → kosong, tak dikirim saat update.
    specifications: [],
  }
}
