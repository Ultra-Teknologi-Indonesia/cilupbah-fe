"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { LocationBinService } from "@/services/manajemen-rak/location-bin.service"
import { locationKeys } from "@/hooks/manajemen-rak/use-locations"
import type { GenerateBinsPayload } from "@/types/manajemen-rak/location"

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
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal generate bin"),
  })
}
