"use client"

import { useQuery } from "@tanstack/react-query"

import { RegionService } from "@/services/manajemen-rak/region.service"

const regionKeys = {
  provinces: ["pengaturan", "regions", "provinces"] as const,
  cities: (provinceId: string) => ["pengaturan", "regions", "cities", provinceId] as const,
  districts: (cityId: string) => ["pengaturan", "regions", "districts", cityId] as const,
  villages: (districtId: string) => ["pengaturan", "regions", "villages", districtId] as const,
}

const STALE = 60 * 60 * 1000 // wilayah jarang berubah

export function useProvinces() {
  return useQuery({
    queryKey: regionKeys.provinces,
    queryFn: () => RegionService.provinces(),
    staleTime: STALE,
  })
}

export function useCities(provinceId: string | undefined) {
  return useQuery({
    queryKey: regionKeys.cities(provinceId ?? ""),
    queryFn: () => RegionService.cities(provinceId as string),
    enabled: Boolean(provinceId),
    staleTime: STALE,
  })
}

export function useDistricts(cityId: string | undefined) {
  return useQuery({
    queryKey: regionKeys.districts(cityId ?? ""),
    queryFn: () => RegionService.districts(cityId as string),
    enabled: Boolean(cityId),
    staleTime: STALE,
  })
}

export function useVillages(districtId: string | undefined) {
  return useQuery({
    queryKey: regionKeys.villages(districtId ?? ""),
    queryFn: () => RegionService.villages(districtId as string),
    enabled: Boolean(districtId),
    staleTime: STALE,
  })
}
