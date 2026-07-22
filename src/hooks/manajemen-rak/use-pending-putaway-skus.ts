"use client";

import { useQuery } from "@tanstack/react-query";

import { LocationBinService } from "@/services/manajemen-rak/location-bin.service";

export function usePendingPutawaySkus(locationId?: string, enabled = true) {
  return useQuery({
    queryKey: ["pending-putaway-skus", locationId] as const,
    queryFn: () => LocationBinService.listPendingPutawaySkus(locationId!),
    enabled: Boolean(locationId) && enabled,
    staleTime: 30_000,
  });
}
