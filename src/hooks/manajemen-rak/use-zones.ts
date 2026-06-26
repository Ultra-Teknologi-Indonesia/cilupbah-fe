"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { LocationZoneService } from "@/services/manajemen-rak/location-zone.service"
import { locationKeys } from "./use-locations"
import type { LocationZoneFormData } from "@/types/manajemen-rak/location"

export const zoneKeys = {
  list: (locationId: string) => [...locationKeys.all, "zones", locationId] as const,
}

export function useZones(locationId?: string) {
  return useQuery({
    queryKey: zoneKeys.list(locationId!),
    queryFn: () => LocationZoneService.list(locationId!),
    enabled: !!locationId,
    staleTime: 30 * 1000,
  })
}

export function useCreateZone(locationId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: LocationZoneFormData) =>
      LocationZoneService.create(locationId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: zoneKeys.list(locationId!) })
      qc.invalidateQueries({ queryKey: locationKeys.detail(locationId!) })
      toast.success("Zona berhasil dibuat")
    },
    onError: () => toast.error("Gagal membuat zona"),
  })
}

export function useUpdateZone(locationId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ zoneId, data }: { zoneId: string; data: LocationZoneFormData }) =>
      LocationZoneService.update(locationId!, zoneId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: zoneKeys.list(locationId!) })
      qc.invalidateQueries({ queryKey: locationKeys.detail(locationId!) })
      toast.success("Zona berhasil diperbarui")
    },
    onError: () => toast.error("Gagal memperbarui zona"),
  })
}

export function useDeleteZone(locationId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (zoneId: string) =>
      LocationZoneService.delete(locationId!, zoneId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: zoneKeys.list(locationId!) })
      qc.invalidateQueries({ queryKey: locationKeys.detail(locationId!) })
      toast.success("Zona berhasil dihapus")
    },
    onError: () => toast.error("Gagal menghapus zona"),
  })
}
