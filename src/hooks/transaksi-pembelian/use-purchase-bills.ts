"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PurchaseBillService } from "@/services/transaksi-pembelian/purchase-bill.service"
import type { PurchaseBillListParams, PurchaseBillFormData } from "@/types/transaksi-pembelian/purchase-bill"

const STALE = 30 * 1000

export function usePurchaseBills(params: PurchaseBillListParams = {}) {
  return useQuery({
    queryKey: ["purchase-bill", "list", params],
    queryFn: () => PurchaseBillService.list(params),
    staleTime: STALE,
  })
}

export function usePurchaseBillDetail(id?: string) {
  return useQuery({
    queryKey: ["purchase-bill", "detail", id],
    queryFn: () => PurchaseBillService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useCreatePurchaseBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: PurchaseBillService.create,
    onSuccess: () => {
      toast.success("Tagihan berhasil dibuat")
      qc.invalidateQueries({ queryKey: ["purchase-bill"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal membuat tagihan"),
  })
}

export function useUpdatePurchaseBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchaseBillFormData }) =>
      PurchaseBillService.update(id, data),
    onSuccess: () => {
      toast.success("Tagihan berhasil diperbarui")
      qc.invalidateQueries({ queryKey: ["purchase-bill"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memperbarui tagihan"),
  })
}

export function useDeletePurchaseBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: PurchaseBillService.delete,
    onSuccess: () => {
      toast.success("Tagihan berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["purchase-bill"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghapus tagihan"),
  })
}
