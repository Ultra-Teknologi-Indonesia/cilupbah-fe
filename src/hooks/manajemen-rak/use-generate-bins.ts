"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiError } from "@/lib/toast";
import { LocationBinService } from "@/services/manajemen-rak/location-bin.service";
import { locationKeys } from "@/hooks/manajemen-rak/use-locations";
import type { GenerateBinsPayload } from "@/types/manajemen-rak/location";

export interface GenerateBinsVars {
  locationId: string;
  payload: GenerateBinsPayload;
}

export function useGenerateBins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locationId, payload }: GenerateBinsVars) =>
      LocationBinService.generate(locationId, payload),
    onSuccess: (_data, { locationId }) => {
      queryClient.invalidateQueries({
        queryKey: locationKeys.detail(locationId),
      });
    },
    onError: (err) => apiError(err, "Gagal generate bin"),
  });
}
