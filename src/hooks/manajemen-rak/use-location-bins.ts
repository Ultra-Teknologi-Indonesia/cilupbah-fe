"use client"

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { toast } from "sonner"

import { LocationBinService } from "@/services/manajemen-rak/location-bin.service"
import type {
  BinListParams,
  GenerateBinsPayload,
  UniformApplyPayload,
} from "@/types/manajemen-rak/location"

export const locationBinKeys = {
  all: ["location-bins"] as const,
  list: (locationId: string, params: BinListParams) =>
    ["location-bins", "list", locationId, params] as const,
  preview: (locationId: string, payload: GenerateBinsPayload, page: number, perPage: number) =>
    ["location-bins", "preview", locationId, payload, page, perPage] as const,
}

// Listing bin existing (paginated, dengan search/filter/sort).
export function useLocationBins(locationId: string | undefined, params: BinListParams = {}) {
  return useQuery({
    queryKey: locationBinKeys.list(locationId ?? "", params),
    queryFn: () => LocationBinService.list(locationId!, params),
    enabled: !!locationId,
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  })
}

// Preview generate (paginated, dipanggil saat user klik "Preview").
export function usePreviewBins(
  locationId: string | undefined,
  payload: GenerateBinsPayload | null,
  page: number,
  perPage: number,
  enabled: boolean
) {
  return useQuery({
    queryKey: locationBinKeys.preview(locationId ?? "", payload as GenerateBinsPayload, page, perPage),
    queryFn: () => LocationBinService.preview(locationId!, payload!, page, perPage),
    enabled: enabled && !!locationId && !!payload,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

// Seragamkan ke baris terpilih atau seluruh data filter aktif.
export function useUniformApplyBins(locationId?: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: UniformApplyPayload) => {
      if (!locationId) throw new Error("locationId is required")
      return LocationBinService.uniformApply(locationId, payload)
    },
    onSuccess: (data) => {
      toast.success(`${data.affected} rak berhasil diperbarui`)
      qc.invalidateQueries({ queryKey: locationBinKeys.all })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal seragamkan rak"),
  })
}
