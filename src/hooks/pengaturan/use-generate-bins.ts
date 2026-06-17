"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { LocationBinService } from "@/services/pengaturan/location-bin.service"
import { locationKeys } from "@/hooks/pengaturan/use-locations"
import type { GenerateBinsPayload } from "@/types/pengaturan/location"

export interface GenerateBinsVars {
  locationId: string
  payload: GenerateBinsPayload
}

export function useGenerateBins() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ locationId, payload }: GenerateBinsVars) =>
      LocationBinService.generate(locationId, payload),
    onSuccess: (_data, { locationId }) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.detail(locationId) })
    },
  })
}
