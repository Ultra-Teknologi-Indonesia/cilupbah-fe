"use client"

import { useQuery } from "@tanstack/react-query"

import { LocationService } from "@/services/pengaturan/location.service"
import { locationKeys } from "@/hooks/pengaturan/use-locations"

export function useLocationDetail(id: string | undefined) {
  return useQuery({
    queryKey: locationKeys.detail(id ?? ""),
    queryFn: () => LocationService.detail(id as string),
    enabled: Boolean(id),
  })
}
