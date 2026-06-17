import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"
import type { RegionOption } from "@/types/manajemen-rak/location"

// Region API mengembalikan baris mentah { id, nama, ... }.
type RawRegion = { id: string | number; nama: string }

function mapRegion(raw: RawRegion): RegionOption {
  return { id: String(raw.id), nama: raw.nama }
}

export const RegionService = {
  provinces: async (): Promise<RegionOption[]> => {
    const res = await fetchClient<ApiResponse<RawRegion[]>>(`/regions/provinces`)
    return (res.data ?? []).map(mapRegion)
  },

  cities: async (provinceId: string): Promise<RegionOption[]> => {
    const res = await fetchClient<ApiResponse<RawRegion[]>>(`/regions/cities/${provinceId}`)
    return (res.data ?? []).map(mapRegion)
  },

  districts: async (cityId: string): Promise<RegionOption[]> => {
    const res = await fetchClient<ApiResponse<RawRegion[]>>(`/regions/districts/${cityId}`)
    return (res.data ?? []).map(mapRegion)
  },

  villages: async (districtId: string): Promise<RegionOption[]> => {
    const res = await fetchClient<ApiResponse<RawRegion[]>>(`/regions/villages/${districtId}`)
    return (res.data ?? []).map(mapRegion)
  },
}
