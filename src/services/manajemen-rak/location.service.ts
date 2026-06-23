import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"
import type {
  Location,
  LocationBin,
  LocationListParams,
  LocationPayload,
  RawLocation,
  RawLocationBin,
} from "@/types/manajemen-rak/location"

function mapBin(raw: RawLocationBin): LocationBin {
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

export function mapLocation(raw: RawLocation): Location {
  return {
    id: raw.id,
    locationCode: raw.location_code,
    locationName: raw.location_name,
    locationType: raw.location_type,
    address: raw.address,
    postCode: raw.post_code,
    villageId: raw.village_id,
    phone: raw.phone,
    email: raw.email,
    coordinate: raw.coordinate,
    defaultWarehouseUser: raw.default_warehouse_user,
    isWarehouse: Boolean(raw.is_warehouse),
    isMultiOrigin: Boolean(raw.is_multi_origin),
    isActive: Boolean(raw.is_active),
    isSystem: Boolean(raw.is_system),
    isLocked: Boolean(raw.is_locked),
    isPos: Boolean(raw.is_pos),
    village: raw.village ?? null,
    bins: (raw.bins ?? []).map(mapBin),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export interface LocationListResult {
  items: Location[]
  meta: ApiPaginated<RawLocation>["meta"]
}

export const LocationService = {
  list: async (params: LocationListParams = {}): Promise<LocationListResult> => {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    if (params.sort) q.set("sort", params.sort)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 20))

    const res = await fetchClient<ApiPaginated<RawLocation>>(
      `/locations?${q.toString()}`
    )
    return { items: (res.data ?? []).map(mapLocation), meta: res.meta }
  },

  detail: async (id: string): Promise<Location> => {
    const res = await fetchClient<ApiResponse<RawLocation>>(`/locations/${id}`)
    return mapLocation(res.data)
  },

  create: async (payload: LocationPayload): Promise<Location> => {
    const res = await fetchClient<ApiResponse<RawLocation>>(`/locations`, {
      method: "POST",
      data: payload,
    })
    return mapLocation(res.data)
  },

  update: async (id: string, payload: Partial<LocationPayload>): Promise<Location> => {
    const res = await fetchClient<ApiResponse<RawLocation>>(`/locations/${id}`, {
      method: "PUT",
      data: payload,
    })
    return mapLocation(res.data)
  },

  remove: async (id: string): Promise<void> => {
    await fetchClient<ApiResponse<null>>(`/locations/${id}`, { method: "DELETE" })
  },

  bulkUpdateBins: async (
    locationId: string,
    bins: {
      id: string
      bin_final_code: string
      max_qty: number
      is_stock_acknowledged: boolean
      is_large_bin: boolean
      category: string | null
    }[]
  ): Promise<{ updated: number }> => {
    const res = await fetchClient<ApiResponse<{ updated: number }>>(
      `/locations/${locationId}/bins/bulk`,
      { method: "PUT", data: { bins } }
    )
    return res.data
  },
}
