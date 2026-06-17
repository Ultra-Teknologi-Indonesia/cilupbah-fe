"use client"

import { useQuery } from "@tanstack/react-query"

import { LocationService } from "@/services/pengaturan/location.service"
import type { LocationListParams } from "@/types/pengaturan/location"

export const locationKeys = {
  all: ["pengaturan", "lokasi"] as const,
  list: (params: LocationListParams) => [...locationKeys.all, "list", params] as const,
  detail: (id: string) => [...locationKeys.all, "detail", id] as const,
}

export function useLocations(params: LocationListParams = {}) {
  return useQuery({
    queryKey: locationKeys.list(params),
    queryFn: () => LocationService.list(params),
    staleTime: 30 * 1000,
  })
}
