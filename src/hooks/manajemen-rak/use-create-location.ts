"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { LocationService } from "@/services/pengaturan/location.service"
import { locationKeys } from "@/hooks/pengaturan/use-locations"
import type { LocationPayload } from "@/types/pengaturan/location"

export function useCreateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LocationPayload) => LocationService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all })
    },
  })
}
