"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { SalesReturnService } from "@/services/barang-masuk/sales-return.service"

export function useAcceptSalesReturn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, processed_by }: { id: string; processed_by: string }) =>
      SalesReturnService.accept(id, { processed_by }),
    onSuccess: () => {
      toast.success("Retur berhasil disetujui")
      qc.invalidateQueries({ queryKey: ["sales-return"] })
      qc.invalidateQueries({ queryKey: ["inbound"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menyetujui retur"),
  })
}

export function useRejectSalesReturn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, processed_by, reason }: { id: string; processed_by: string; reason?: string }) =>
      SalesReturnService.reject(id, { processed_by, reason }),
    onSuccess: () => {
      toast.success("Retur berhasil ditolak")
      qc.invalidateQueries({ queryKey: ["sales-return"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menolak retur"),
  })
}
