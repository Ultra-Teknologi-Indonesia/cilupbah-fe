"use client"

import { useQuery } from "@tanstack/react-query"

import { LocationService } from "@/services/manajemen-rak/location.service"
import { locationKeys } from "@/hooks/manajemen-rak/use-locations"

export function useLocationDetail(id: string | undefined) {
  return useQuery({
    queryKey: locationKeys.detail(id ?? ""),
    queryFn: () => LocationService.detail(id as string),
    enabled: Boolean(id),
  })
}
