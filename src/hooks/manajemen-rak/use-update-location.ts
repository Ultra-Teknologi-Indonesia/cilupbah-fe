"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { LocationService } from "@/services/manajemen-rak/location.service"
import { locationKeys } from "@/hooks/manajemen-rak/use-locations"
import type { LocationPayload } from "@/types/manajemen-rak/location"

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
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memperbarui lokasi"),
  })
}
