"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { LocationService } from "@/services/pengaturan/location.service"
import { locationKeys } from "@/hooks/pengaturan/use-locations"

export interface ToggleLocationActiveVars {
  id: string
  isActive: boolean
}

export function useToggleLocationActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: ToggleLocationActiveVars) =>
      LocationService.update(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all })
    },
  })
}
