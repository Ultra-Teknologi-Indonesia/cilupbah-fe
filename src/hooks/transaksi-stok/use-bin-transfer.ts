"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchClient } from "@/lib/api-client"
import { LocationBinService } from "@/services/manajemen-rak/location-bin.service"

export function useLocationBins(locationId: string) {
  return useQuery({
    queryKey: ["location-bins", locationId],
    enabled: !!locationId,
    queryFn: () => LocationBinService.list(locationId, { perPage: 200, sort: "bin_final_code" }),
    staleTime: 60 * 1000,
  })
}

export interface BinTransferPayload {
  item_id: string
  location_id: string
  source_bin_id: string
  destination_bin_id: string
  qty: number
  created_by: string
  batch_no?: string
  serial_no?: string
}

export function useBinTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: BinTransferPayload) => {
      const res = await fetchClient<{ data: unknown }>("/inventory/bin-transfer", {
        method: "POST",
        data: payload,
      })
      return res.data
    },
    onSuccess: () => {
      toast.success("Stok berhasil dipindahkan antar bin")
      qc.invalidateQueries({ queryKey: ["inventory"] })
      qc.invalidateQueries({ queryKey: ["posisi-stok"] })
      qc.invalidateQueries({ queryKey: ["monitor-stok"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memindahkan stok"),
  })
}
