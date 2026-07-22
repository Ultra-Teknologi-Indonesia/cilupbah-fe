"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiError } from "@/lib/toast";
import { LocationBinService } from "@/services/manajemen-rak/location-bin.service";
import { locationBinKeys } from "@/hooks/manajemen-rak/use-location-bins";
import { locationKeys } from "@/hooks/manajemen-rak/use-locations";

interface ImportBinsVars {
  locationId: string;
  file: File;
}

export function useImportBinsPreview() {
  return useMutation({
    mutationFn: ({ locationId, file }: ImportBinsVars) =>
      LocationBinService.importPreview(locationId, file),
    onError: (err) => apiError(err, "Gagal membaca file"),
  });
}

export function useImportBins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locationId, file }: ImportBinsVars) =>
      LocationBinService.import(locationId, file),
    onSuccess: (_data, { locationId }) => {
      queryClient.invalidateQueries({ queryKey: locationBinKeys.all });
      queryClient.invalidateQueries({
        queryKey: locationKeys.detail(locationId),
      });
    },
    onError: (err) => apiError(err, "Gagal import rak"),
  });
}
