import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"
import type { LocationZone, LocationZoneFormData } from "@/types/manajemen-rak/location"

const base = (locationId: string) => `/locations/${locationId}/zones`

export const LocationZoneService = {
  list: async (locationId: string) => {
    const res = await fetchClient<ApiResponse<LocationZone[]>>(base(locationId))
    return res.data ?? []
  },

  create: async (locationId: string, data: LocationZoneFormData) => {
    const res = await fetchClient<ApiResponse<LocationZone>>(base(locationId), {
      method: "POST",
      data,
    })
    return res.data
  },

  update: async (locationId: string, zoneId: string, data: LocationZoneFormData) => {
    const res = await fetchClient<ApiResponse<LocationZone>>(
      `${base(locationId)}/${zoneId}`,
      { method: "PUT", data }
    )
    return res.data
  },

  delete: async (locationId: string, zoneId: string) => {
    await fetchClient(`${base(locationId)}/${zoneId}`, { method: "DELETE" })
  },
}
