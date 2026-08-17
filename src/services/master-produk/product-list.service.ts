import { fetchClient } from "@/lib/api-client";
import type { ApiPaginated } from "@/types/api.types";
import type { Product, RawMasterItem } from "@/types/master-produk";

export interface MasterProductsParams {
  search?: string;
  status?: string;
  categoryId?: string;

  type?: string;
  minPrice?: number;
  maxPrice?: number;

  channel?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}

export interface MasterProductsResult {
  items: Product[];
  meta: ApiPaginated<RawMasterItem>["meta"];
}

function mapMasterItem(raw: RawMasterItem): Product {
  return {
    itemGroupId: raw.item_group_id,
    itemName: raw.item_name,
    sku: raw.sku ?? null,
    status: raw.status,
    isPo: raw.is_po,
    isConsignment: raw.is_consignment,
    isBundle: raw.is_bundle,
    categoryName: raw.category_name ?? "—",
    sellPrice: raw.sell_price,
    totalVariants: raw.total_variants,
    totalComponents: raw.total_components ?? (raw.is_bundle ? raw.total_variants : undefined),
    lastModified: raw.last_modified,
    thumbnail: raw.thumbnail,
    variations: raw.variations ?? [],
    variants: (raw.variants ?? []).map((v) => ({
      itemId: v.item_id,
      sku: v.item_code ?? "",
      sellPrice: v.sell_price,
      barcode: v.barcode,
      taxRate: v.tax_rate,
      thumbnail: v.thumbnail ?? null,
      variationValues: v.variation_values ?? [],
      storeNames: (v.store_names ?? []).map((s) => ({
        storeName: s.store_name,
      })),
    })),
    onlineStatus: (raw.online_status ?? []).map((o) => ({
      channelCode: o.channel_code ?? "",
      channelName: o.channel_name ?? o.channel_code ?? "Channel",
      storeName: o.store_name ?? "",
      channelUrl: o.channel_url,
      errorText: o.error_text,
    })),
    isMerged: raw.is_merged ?? false,
    masterName: raw.master_name ?? null,
    memberIds: raw.member_ids ?? [raw.item_group_id],
  };
}

export const ProductListService = {
  getMasterProducts: async (
    params: MasterProductsParams = {},
  ): Promise<MasterProductsResult> => {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.status) q.set("status", params.status);
    if (params.categoryId) q.set("filter[category_id]", params.categoryId);
    if (params.type) q.set("filter[type]", params.type);
    if (params.minPrice != null)
      q.set("filter[min_price]", String(params.minPrice));
    if (params.maxPrice != null)
      q.set("filter[max_price]", String(params.maxPrice));
    if (params.channel) q.set("filter[channel]", params.channel);
    if (params.sort) q.set("sort", params.sort);
    q.set("page", String(params.page ?? 1));
    q.set("per_page", String(params.perPage ?? 20));

    const res = await fetchClient<ApiPaginated<RawMasterItem>>(
      `/products/master?${q.toString()}`,
    );
    return { items: (res.data ?? []).map(mapMasterItem), meta: res.meta };
  },

  getDownloadedProducts: async (
    params: Omit<MasterProductsParams, "status"> = {},
  ): Promise<MasterProductsResult> => {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.categoryId) q.set("filter[category_id]", params.categoryId);
    if (params.type) q.set("filter[type]", params.type);
    if (params.minPrice != null)
      q.set("filter[min_price]", String(params.minPrice));
    if (params.maxPrice != null)
      q.set("filter[max_price]", String(params.maxPrice));
    if (params.channel) q.set("filter[channel]", params.channel);
    if (params.sort) q.set("sort", params.sort);
    q.set("page", String(params.page ?? 1));
    q.set("per_page", String(params.perPage ?? 20));

    const res = await fetchClient<ApiPaginated<RawMasterItem>>(
      `/products/downloaded?${q.toString()}`,
    );
    return { items: (res.data ?? []).map(mapMasterItem), meta: res.meta };
  },

  getPickerProducts: async (
    params: MasterProductsParams = {},
  ): Promise<MasterProductsResult> => {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.status) q.set("status", params.status);
    if (params.categoryId) q.set("filter[category_id]", params.categoryId);
    q.set("page", String(params.page ?? 1));
    q.set("per_page", String(params.perPage ?? 20));

    const res = await fetchClient<ApiPaginated<RawMasterItem>>(
      `/products/picker?${q.toString()}`,
    );
    return { items: (res.data ?? []).map(mapMasterItem), meta: res.meta };
  },
};
