"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiError } from "@/lib/toast";
import { LocationService } from "@/services/manajemen-rak/location.service";
import { locationKeys } from "@/hooks/manajemen-rak/use-locations";
import type { LocationPayload } from "@/types/manajemen-rak/location";

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LocationPayload) => LocationService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
    },
    onError: (err) => apiError(err, "Gagal membuat lokasi"),
  });
}
