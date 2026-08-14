import type {
  BuatProdukFormValues,
  CreateMediaInput,
  CreateProductPayload,
  CreateVariantInput,
  ProductCreateStatus,
} from "@/types/master-produk";

import type { VariantMediaEntry } from "./build-update-payload";

function num(value?: string | null): number | undefined {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

export function buildCreatePayload(
  values: BuatProdukFormValues,
  opts: {
    status: ProductCreateStatus;
    media?: CreateMediaInput[];
    variantMedia?: VariantMediaEntry[];
  },
): CreateProductPayload {
  const sku = values.sku.trim();
  const hasVariants = values.variationTypes.length > 0;

  const singleVariant: CreateVariantInput = {
    sku,
    sell_price: num(values.sellPrice) ?? 0,
    is_active: true,
  };

  const typeNameById = new Map(
    values.variationTypes.map((t) => [t.attributeId, t.name]),
  );

  const variants: CreateVariantInput[] = hasVariants
    ? values.variants.map((row) => {
        const v: CreateVariantInput = {
          sku: row.sku.trim(),
          sell_price: num(row.sellPrice) ?? num(values.sellPrice) ?? 0,
          weight: num(row.weight) ?? null,
          is_active: true,
          options: row.options.map((o) =>
            o.attributeId < 0
              ? { name: typeNameById.get(o.attributeId) ?? "", value: o.value }
              : { attribute_id: o.attributeId, value: o.value },
          ),
        };
        const vm = opts.variantMedia?.find((m) => m.variantKey === row.key);
        if (vm) {
          v.media = [
            {
              media_uuid: vm.mediaUuid,
              media_type: "image",
              is_primary: true,
              sort_order: 0,
            },
          ];
        }
        return v;
      })
    : [singleVariant];

  const specifications = values.specifications
    .filter((s) => (s.value ?? "").trim() !== "")
    .map((s) => ({
      attribute_id: s.attributeId,
      text_value: (s.value ?? "").trim(),
    }));

  return {
    name: values.name.trim(),
    sku: sku || null,
    category_id: Number(values.category!.id),
    description: values.description?.trim() || null,
    is_bundle: values.isBundle,
    status: opts.status,
    weight: num(values.weight) ?? null,
    weight_unit: values.weightUnit ?? "kg",
    length: num(values.length) ?? null,
    width: num(values.width) ?? null,
    height: num(values.height) ?? null,
    ...(opts.media?.length ? { media: opts.media } : {}),
    ...(hasVariants
      ? {
          variation_types: values.variationTypes.map((t, i) =>
            t.attributeId < 0
              ? { name: t.name, sort_order: i }
              : { attribute_id: t.attributeId, sort_order: i },
          ),
        }
      : {}),
    ...(specifications.length ? { specifications } : {}),
    variants,
  };
}
