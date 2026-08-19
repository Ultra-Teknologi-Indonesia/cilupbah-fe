import { ProductListService } from "@/services/master-produk/product-list.service";
import type { LookupOption } from "@/types/common";

export const ProductPickerService = {
  searchVariants: async (
    search: string,
    perPage = 20,
  ): Promise<LookupOption[]> => {
    const res = await ProductListService.getPickerProducts({
      search: search || undefined,
      perPage,
    });
    const options: LookupOption[] = [];
    for (const p of res.items) {
      for (const v of p.variants) {
        if (search) {
          const sLower = search.toLowerCase();
          const matchSku = (v.sku || "").toLowerCase().includes(sLower);
          const matchName = (p.itemName || "").toLowerCase().includes(sLower);
          const matchVar = v.variationValues.some((vv) =>
            vv.value.toLowerCase().includes(sLower),
          );
          if (!matchSku && !matchName && !matchVar) continue;
        }
        const varLabel = v.variationValues.map((vv) => vv.value).join(", ");
        options.push({
          value: v.itemId,
          label: varLabel ? `${p.itemName} (${varLabel}) — ${v.sku}` : `${p.itemName} — ${v.sku}`,
          badgeLabel: v.sku,
        });
      }
    }
    return options.slice(0, perPage);
  },

  searchProducts: async (
    search: string,
    perPage = 20,
  ): Promise<LookupOption[]> => {
    const res = await ProductListService.getPickerProducts({
      search: search || undefined,
      perPage,
    });
    return res.items.map((p) => ({
      value: p.itemGroupId,
      label: p.itemName,
      hint: p.variants?.[0]?.sku ?? undefined,
      badgeLabel: p.itemName,
    }));
  },
};
