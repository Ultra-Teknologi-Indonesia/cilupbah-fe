"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import {
  PantauanService,
  type PantauanParams,
} from "@/services/master-produk/pantauan.service"

export type {
  PantauanParams,
  PantauanLens,
  PantauanProduct,
  ProductTypeFilter,
} from "@/services/master-produk/pantauan.service"

export const pantauanKey = (params: PantauanParams) =>
  ["master-produk", "pantauan", params] as const

export function usePantauan(params: PantauanParams) {
  return useQuery({
    queryKey: pantauanKey(params),
    queryFn: () => PantauanService.list(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}

export function useRefreshChannelData() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => PantauanService.refresh(),
    onSuccess: (res) => {
      if (res.queued > 0) {
        toast.success(`Penyegaran ${res.queued} toko diantrekan`, {
          description: "Data channel akan diperbarui sebentar lagi.",
        })
      } else {
        toast("Tidak ada toko yang bisa disegarkan", {
          description: res.skippedChannels.length
            ? `Channel belum didukung: ${res.skippedChannels.join(", ")}`
            : "Belum ada toko aktif.",
        })
      }
      qc.invalidateQueries({ queryKey: ["master-produk", "pantauan"] })
    },
    onError: (err) => toast.error((err as { message?: string })?.message || "Gagal menyegarkan data"),
  })
}
