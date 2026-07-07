import { fetchClient } from "@/lib/api-client";
import type { ApiPaginated } from "@/types/api.types";
import type { LookupOption } from "@/types/common";

interface RawVariant {
  id: string;
  sku: string;
  product?: { id: string; name: string; sku: string | null } | null;
}

interface RawProduct {
  id: string;
  name: string;
  sku: string | null;
}

export const ProductPickerService = {
  searchVariants: async (
    search: string,
    perPage = 20,
  ): Promise<LookupOption[]> => {
    const q = new URLSearchParams();
    if (search) q.set("filter[sku]", search);
    q.set("per_page", String(perPage));

    const res = await fetchClient<ApiPaginated<RawVariant>>(
      `/variations?${q.toString()}`,
    );
    return (res.data ?? []).map((v) => ({
      value: v.id,
      label: v.product?.name ? `${v.product.name} — ${v.sku}` : v.sku,
      hint: v.sku,
    }));
  },

  searchProducts: async (
    search: string,
    perPage = 20,
  ): Promise<LookupOption[]> => {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    q.set("per_page", String(perPage));

    const res = await fetchClient<ApiPaginated<RawProduct>>(
      `/products?${q.toString()}`,
    );
    return (res.data ?? []).map((p) => ({
      value: p.id,
      label: p.name,
      hint: p.sku ?? undefined,
    }));
  },
};
