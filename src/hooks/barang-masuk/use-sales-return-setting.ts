"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { SalesReturnSettingService } from "@/services/barang-masuk/sales-return-setting.service"
import type { SalesReturnSettingPayload } from "@/types/barang-masuk/sales-return-setting"

const KEY = ["sales-return-setting"]

export function useSalesReturnSetting() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => SalesReturnSettingService.get(),
    staleTime: 60 * 1000,
  })
}

export function useSaveSalesReturnSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SalesReturnSettingPayload) => SalesReturnSettingService.save(data),
    onSuccess: () => {
      toast.success("Pengaturan retur disimpan")
      qc.invalidateQueries({ queryKey: KEY })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menyimpan pengaturan"),
  })
}
