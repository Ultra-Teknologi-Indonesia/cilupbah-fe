import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated } from "@/types/api.types"
import type { Product, RawMasterItem } from "@/types/master-produk"

export interface MasterProductsParams {
  search?: string
  status?: string
  brandId?: string
  categoryId?: string
  
  sort?: string
  page?: number
  perPage?: number
}

export interface MasterProductsResult {
  items: Product[]
  meta: ApiPaginated<RawMasterItem>["meta"]
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
    brandName: raw.brand_name ?? "—",
    sellPrice: raw.sell_price,
    totalVariants: raw.total_variants,
    lastModified: raw.last_modified,
    thumbnail: raw.thumbnail,
    variations: raw.variations ?? [],
    variants: (raw.variants ?? []).map((v) => ({
      itemId: v.item_id,
      sku: v.item_code ?? "",
      sellPrice: v.sell_price,
      barcode: v.barcode,
      taxRate: v.tax_rate,
      variationValues: v.variation_values ?? [],
      storeNames: (v.store_names ?? []).map((s) => ({ storeName: s.store_name })),
      
    })),
    onlineStatus: (raw.online_status ?? []).map((o) => ({
      channelCode: o.channel_code ?? "",
      channelName: o.channel_name ?? o.channel_code ?? "Channel",
      storeName: o.store_name ?? "",
      channelUrl: o.channel_url,
      errorText: o.error_text,
    })),
  }
}

export const ProductListService = {
  getMasterProducts: async (
    params: MasterProductsParams = {}
  ): Promise<MasterProductsResult> => {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    if (params.status) q.set("status", params.status)
    if (params.brandId) q.set("filter[brand_id]", params.brandId)
    if (params.categoryId) q.set("filter[category_id]", params.categoryId)
    if (params.sort) q.set("sort", params.sort)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 20))

    const res = await fetchClient<ApiPaginated<RawMasterItem>>(
      `/products/master?${q.toString()}`
    )
    return { items: (res.data ?? []).map(mapMasterItem), meta: res.meta }
  },
}
