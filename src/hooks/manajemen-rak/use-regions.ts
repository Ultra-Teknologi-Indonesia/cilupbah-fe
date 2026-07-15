"use client";

import { useQuery } from "@tanstack/react-query";

import { RegionService } from "@/services/manajemen-rak/region.service";

const regionKeys = {
  countries: ["pengaturan", "regions", "countries"] as const,
  provinces: (search?: string) =>
    ["pengaturan", "regions", "provinces", search ?? ""] as const,
  cities: (provinceId: string, search?: string) =>
    ["pengaturan", "regions", "cities", provinceId, search ?? ""] as const,
  districts: (cityId: string, search?: string) =>
    ["pengaturan", "regions", "districts", cityId, search ?? ""] as const,
  villages: (districtId: string, search?: string) =>
    ["pengaturan", "regions", "villages", districtId, search ?? ""] as const,
};

const STALE = 60 * 60 * 1000;

export function useCountries() {
  return useQuery({
    queryKey: regionKeys.countries,
    queryFn: () => RegionService.countries(),
    staleTime: STALE,
  });
}

export function useProvinces(search?: string) {
  return useQuery({
    queryKey: regionKeys.provinces(search),
    queryFn: () => RegionService.provinces(search),
    staleTime: STALE,
  });
}

export function useCities(provinceId: string | undefined, search?: string) {
  return useQuery({
    queryKey: regionKeys.cities(provinceId ?? "", search),
    queryFn: () => RegionService.cities(provinceId as string, search),
    enabled: Boolean(provinceId),
    staleTime: STALE,
  });
}

export function useDistricts(cityId: string | undefined, search?: string) {
  return useQuery({
    queryKey: regionKeys.districts(cityId ?? "", search),
    queryFn: () => RegionService.districts(cityId as string, search),
    enabled: Boolean(cityId),
    staleTime: STALE,
  });
}

export function useVillages(districtId: string | undefined, search?: string) {
  return useQuery({
    queryKey: regionKeys.villages(districtId ?? "", search),
    queryFn: () => RegionService.villages(districtId as string, search),
    enabled: Boolean(districtId),
    staleTime: STALE,
  });
}
