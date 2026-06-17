"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { LocationService } from "@/services/pengaturan/location.service"
import { locationKeys } from "@/hooks/pengaturan/use-locations"
import type { LocationPayload } from "@/types/pengaturan/location"

export interface UpdateLocationVars {
  id: string
  payload: Partial<LocationPayload>
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: UpdateLocationVars) =>
      LocationService.update(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all })
      queryClient.invalidateQueries({ queryKey: locationKeys.detail(id) })
    },
  })
}
