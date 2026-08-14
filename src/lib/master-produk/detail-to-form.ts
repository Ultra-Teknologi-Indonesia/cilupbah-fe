import type {
  BuatProdukFormValues,
  ProductDetail,
} from "@/types/master-produk";
import { buildCombos, comboKey, comboLabel } from "./variant-combos";

const s = (n: number | null | undefined): string =>
  n == null ? "" : String(n);

function reconstructVariants(p: ProductDetail) {
  const active = p.variants.filter((v) => v.isActive);
  const types = [...p.variationTypes].sort((a, b) => a.sortOrder - b.sortOrder);

  const valuesByType = new Map<number, string[]>();
  for (const t of types) valuesByType.set(t.attributeId, []);
  for (const v of active) {
    for (const o of v.options) {
      const arr = valuesByType.get(o.attributeId);
      if (arr && !arr.some((x) => x.toLowerCase() === o.value.toLowerCase()))
        arr.push(o.value);
    }
  }

  const variationTypes = types.map((t) => ({
    attributeId: t.attributeId,
    name: t.name ?? "",
    values: valuesByType.get(t.attributeId) ?? [],
  }));

  const variants = buildCombos(variationTypes).map((opts) => {
    const match = active.find((v) => {
      const m = new Map(
        v.options.map((o) => [o.attributeId, o.value.toLowerCase()]),
      );
      return (
        m.size === opts.length &&
        opts.every((o) => m.get(o.attributeId) === o.value.toLowerCase())
      );
    });
    return {
      key: comboKey(opts),
      label: comboLabel(opts),
      options: opts,
      sku: match?.sku ?? "",
      image: match?.image ?? null,
      imageFile: undefined,
      sellPrice: match?.sellPrice != null ? String(match.sellPrice) : "",
      weight: match?.weight != null ? String(match.weight) : "",
    };
  });

  return { variationTypes, variants };
}

export function detailVariantLocks(p: ProductDetail): {
  lockedTypeIds: number[];
} {
  const { variationTypes } = reconstructVariants(p);
  return {
    lockedTypeIds: variationTypes.map((t) => t.attributeId),
  };
}

export function detailToFormValues(p: ProductDetail): BuatProdukFormValues {
  const variant = p.variants[0];
  const { variationTypes, variants } = reconstructVariants(p);

  return {
    name: p.name,
    sku: p.sku ?? variant?.sku ?? "",
    category: p.category
      ? {
          id: String(p.category.id),
          name: p.category.name,
          path: [p.category.name],
        }
      : null,
    description: p.description ?? "",
    isBundle: p.isBundle,
    sellPrice: s(variant?.sellPrice ?? null),
    weight: s(p.weight),
    weightUnit: p.weightUnit ?? "kg",
    length: s(p.length),
    width: s(p.width),
    height: s(p.height),
    variationTypes,
    variants,

    specifications: (p.specifications ?? []).map((s) => ({
      attributeId: s.attributeId,
      value: s.value ?? "",
    })),

    bundleComponents: p.bundleComponents.map((c) => ({
      variantId: c.componentVariantId,
      productName: c.product?.name ?? "",
      sku: c.sku,
      thumbnail: c.thumbnail ?? null,
      variationValues: c.variationValues.map((o) => ({ value: o.value })),
      qty: c.qty,
    })),
  };
}
