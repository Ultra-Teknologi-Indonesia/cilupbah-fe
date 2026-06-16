import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"

/** Baris varian dari GET /products/{id}/variants. */
export interface VariantRow {
  id: string
  sku: string
  barcode: string | null
  sellPrice: number | null
  isActive: boolean
  options: { attributeId: number; value: string }[]
  stock: number
}

interface RawVariantRow {
  id: string
  sku: string
  barcode: string | null
  sell_price: number | null
  is_active: boolean
  options?: Array<{ attribute_id: number; value: string }>
  stock?: number
}

export interface VariantsParams {
  page?: number
  perPage?: number
  search?: string
  option?: string
  /** Spatie sort: sku | sell_price | stock (awali "-" untuk desc). */
  sort?: string
}

type PageMeta = ApiPaginated<unknown>["meta"]

export interface VariantsResult {
  items: VariantRow[]
  meta: PageMeta
}

export type BulkVariantAction = "activate" | "deactivate" | "delete"

function mapRow(r: RawVariantRow): VariantRow {
  return {
    id: r.id,
    sku: r.sku,
    barcode: r.barcode,
    sellPrice: r.sell_price,
    isActive: r.is_active,
    options: (r.options ?? []).map((o) => ({ attributeId: o.attribute_id, value: o.value })),
    stock: r.stock ?? 0,
  }
}

export const ProductTabsService = {
  variants: async (productId: string, params: VariantsParams = {}): Promise<VariantsResult> => {
    const q = new URLSearchParams()
    if (params.page) q.set("page", String(params.page))
    if (params.perPage) q.set("per_page", String(params.perPage))
    if (params.search?.trim()) q.set("search", params.search.trim())
    if (params.option?.trim()) q.set("filter[option]", params.option.trim())
    if (params.sort) q.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<RawVariantRow>>(
      `/products/${productId}/variants?${q.toString()}`
    )
    return { items: (res.data ?? []).map(mapRow), meta: res.meta }
  },

  bulkVariants: async (
    productId: string,
    body: { action: BulkVariantAction; variant_ids: string[] }
  ): Promise<ApiResponse<{ affected?: number; deleted?: number; blocked?: string[] }>> => {
    return fetchClient(`/products/${productId}/variants/bulk`, { method: "POST", data: body })
  },
}
