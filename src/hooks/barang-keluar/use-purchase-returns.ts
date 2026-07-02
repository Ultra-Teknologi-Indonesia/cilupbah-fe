"use client"

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { toast } from "sonner"
import { PurchaseReturnService } from "@/services/barang-keluar/purchase-return.service"
import type { PurchaseReturnListParams, CreatePurchaseReturnPayload } from "@/types/barang-keluar/purchase-return"

const STALE = 30 * 1000

export function usePurchaseReturns(params: PurchaseReturnListParams = {}) {
  return useQuery({
    queryKey: ["purchase-return", "list", params],
    placeholderData: keepPreviousData,
    queryFn: () => PurchaseReturnService.list(params),
    staleTime: STALE,
  })
}

export function usePurchaseReturnDetail(id?: string) {
  return useQuery({
    queryKey: ["purchase-return", "detail", id],
    queryFn: () => PurchaseReturnService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useCreatePurchaseReturn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePurchaseReturnPayload) => PurchaseReturnService.create(data),
    onSuccess: () => {
      toast.success("Retur pembelian berhasil dibuat")
      qc.invalidateQueries({ queryKey: ["purchase-return"] })
    },
    onError: (err) => toast.error((err as { message?: string })?.message || "Gagal membuat retur"),
  })
}

export function useProcessPurchaseReturn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { processed_by: string } }) =>
      PurchaseReturnService.process(id, data),
    onSuccess: () => {
      toast.success("Retur pembelian berhasil diproses — stok telah dikurangi")
      qc.invalidateQueries({ queryKey: ["purchase-return"] })
    },
    onError: (err) => toast.error((err as { message?: string })?.message || "Gagal memproses retur"),
  })
}

export function useDeletePurchaseReturn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => PurchaseReturnService.delete(id),
    onSuccess: () => {
      toast.success("Retur pembelian berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["purchase-return"] })
    },
    onError: (err) => toast.error((err as { message?: string })?.message || "Gagal menghapus retur"),
  })
}
