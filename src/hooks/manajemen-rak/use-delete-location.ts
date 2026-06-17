"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { LocationService } from "@/services/manajemen-rak/location.service"
import { locationKeys } from "@/hooks/manajemen-rak/use-locations"

export function useDeleteLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => LocationService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all })
    },
  })
}
