"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { LocationBinService } from "@/services/manajemen-rak/location-bin.service";
import { locationKeys } from "@/hooks/manajemen-rak/use-locations";
import { locationBinKeys } from "@/hooks/manajemen-rak/use-location-bins";

export function useAssignBinSku(locationId?: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ binId, itemId }: { binId: string; itemId: string }) => {
      if (!locationId) throw new Error("locationId is required");
      return LocationBinService.assignSku(locationId, binId, itemId);
    },
    onSuccess: () => {
      if (locationId) {
        qc.invalidateQueries({ queryKey: locationKeys.detail(locationId) });
      }
      qc.invalidateQueries({ queryKey: locationBinKeys.all });
      qc.invalidateQueries({ queryKey: ["pending-putaway-skus"] });
    },
  });
}
