"use client";

import { useQuery } from "@tanstack/react-query";

import { LocationService } from "@/services/manajemen-rak/location.service";
import type { LocationListParams } from "@/types/manajemen-rak/location";

export const locationKeys = {
  all: ["pengaturan", "lokasi"] as const,
  list: (params: LocationListParams) =>
    [...locationKeys.all, "list", params] as const,
  detail: (id: string) => [...locationKeys.all, "detail", id] as const,
};

export function useLocations(params: LocationListParams = {}, enabled = true) {
  const excludeTransit = params.excludeTransit ?? true;

  return useQuery({
    enabled,
    queryKey: locationKeys.list(params),
    queryFn: async () => {
      const data = await LocationService.list(params);
      if (excludeTransit) {
        data.items = data.items.filter(
          (loc) => !loc.locationName.toLowerCase().includes("transit"),
        );
      }
      return data;
    },
    staleTime: 30 * 1000,
  });
}
