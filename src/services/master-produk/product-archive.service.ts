import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated } from "@/types/api.types"
import type { ArchivedProduct, RawArchivedItem } from "@/types/master-produk"

export interface ArchiveParams {
  search?: string
  page?: number
  perPage?: number
}

export interface ArchiveResult {
  items: ArchivedProduct[]
  meta: ApiPaginated<RawArchivedItem>["meta"]
}

function mapArchived(raw: RawArchivedItem): ArchivedProduct {
  return {
    itemGroupId: raw.item_group_id,
    itemName: raw.item_name,
    sku: raw.sku ?? null,
    categoryName: raw.category_name ?? "—",
    thumbnail: raw.thumbnail,
    totalVariants: raw.total_variants,
    archivedAt: raw.archived_at,
    archivedBy: raw.archived_by,
    archiveReason: raw.archive_reason,
  }
}

export const ProductArchiveService = {
  list: async (params: ArchiveParams = {}): Promise<ArchiveResult> => {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 20))

    const res = await fetchClient<ApiPaginated<RawArchivedItem>>(
      `/products/archives?${q.toString()}`
    )
    return { items: (res.data ?? []).map(mapArchived), meta: res.meta }
  },
}
