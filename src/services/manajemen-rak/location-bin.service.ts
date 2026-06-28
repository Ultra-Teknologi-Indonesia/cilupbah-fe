import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"
import type {
  BinListParams,
  BinPreviewItem,
  GenerateBinsPayload,
  LocationBin,
  RawLocationBin,
  UniformApplyPayload,
} from "@/types/manajemen-rak/location"

function mapBin(raw: RawLocationBin): LocationBin & { id: string } {
  return {
    id: raw.id,
    floorCode: raw.floor_code,
    rowCode: raw.row_code,
    columnCode: raw.column_code,
    binCode: raw.bin_code,
    binFinalCode: raw.bin_final_code,
    maxQty: raw.max_qty,
    isInbound: raw.is_inbound,
    isStockAcknowledged: raw.is_stock_acknowledged ?? true,
    isLargeBin: raw.is_large_bin ?? false,
    category: raw.category ?? null,
  }
}

function mapPreviewItem(raw: {
  floor_code: string
  row_code: string
  column_code: string
  bin_code: string
  bin_final_code: string
  max_qty: number
}): BinPreviewItem {
  return {
    floorCode: raw.floor_code,
    rowCode: raw.row_code,
    columnCode: raw.column_code,
    binCode: raw.bin_code,
    binFinalCode: raw.bin_final_code,
    maxQty: raw.max_qty,
    isStockAcknowledged: true,
    isLargeBin: false,
    category: "",
  }
}

function buildBinQuery(params: BinListParams = {}): string {
  const q = new URLSearchParams()
  q.set("page", String(params.page ?? 1))
  q.set("per_page", String(params.perPage ?? 50))
  if (params.search) q.set("search", params.search)
  if (params.sort) q.set("sort", params.sort)
  if (params.filter) {
    for (const [key, val] of Object.entries(params.filter)) {
      if (val !== undefined && val !== null && val !== "") {
        q.set(`filter[${key}]`, String(val))
      }
    }
  }
  return q.toString()
}

export interface BinListResult {
  items: (LocationBin & { id: string })[]
  meta: ApiPaginated<RawLocationBin>["meta"]
}

export interface BinPreviewResult {
  items: BinPreviewItem[]
  meta: ApiPaginated<unknown>["meta"]
}

export const LocationBinService = {
  // Simpan kombinasi rak ke lokasi (butuh lokasi sudah tersimpan).
  generate: async (
    locationId: string,
    payload: GenerateBinsPayload
  ): Promise<{ generatedCount: number }> => {
    const res = await fetchClient<ApiResponse<{ generated_count: number }>>(
      `/locations/${locationId}/bins/generate`,
      { method: "POST", data: payload }
    )
    return { generatedCount: res.data?.generated_count ?? 0 }
  },

  // Preview generate dengan pagination (slice via offset math di BE).
  preview: async (
    locationId: string,
    payload: GenerateBinsPayload,
    page = 1,
    perPage = 50
  ): Promise<BinPreviewResult> => {
    const res = await fetchClient<ApiPaginated<{
      floor_code: string
      row_code: string
      column_code: string
      bin_code: string
      bin_final_code: string
      max_qty: number
    }>>(`/locations/${locationId}/bins/preview`, {
      method: "POST",
      data: { ...payload, page, per_page: perPage },
    })
    return {
      items: (res.data ?? []).map(mapPreviewItem),
      meta: res.meta,
    }
  },

  // List bin existing (Spatie: search/filter/sort/per_page).
  list: async (
    locationId: string,
    params: BinListParams = {}
  ): Promise<BinListResult> => {
    const res = await fetchClient<ApiPaginated<RawLocationBin>>(
      `/locations/${locationId}/bins?${buildBinQuery(params)}`
    )
    return { items: (res.data ?? []).map(mapBin), meta: res.meta }
  },

  // Apply nilai seragam ke baris terpilih atau seluruh data filter aktif.
  uniformApply: async (
    locationId: string,
    payload: UniformApplyPayload
  ): Promise<{ affected: number }> => {
    const qs =
      payload.scope === "all"
        ? `?${buildBinQuery({
            search: payload.search,
            filter: payload.filter,
            page: 1,
            perPage: 1,
          })}`
        : ""

    const res = await fetchClient<ApiResponse<{ affected: number }>>(
      `/locations/${locationId}/bins/uniform-apply${qs}`,
      {
        method: "POST",
        data: {
          scope: payload.scope,
          ids: payload.ids,
          values: payload.values,
        },
      }
    )
    return res.data
  },
}
