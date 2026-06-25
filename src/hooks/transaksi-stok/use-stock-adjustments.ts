"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { StockAdjustmentService } from "@/services/transaksi-stok/stock-adjustment.service"
import type { StockAdjustmentListParams, StockAdjustmentFormData } from "@/types/transaksi-stok/stock-adjustment"

const STALE = 30 * 1000

export function useStockAdjustments(params: StockAdjustmentListParams = {}) {
  return useQuery({
    queryKey: ["stock-adjustment", "list", params],
    queryFn: () => StockAdjustmentService.list(params),
    staleTime: STALE,
  })
}

export function useStockAdjustmentDetail(id?: string) {
  return useQuery({
    queryKey: ["stock-adjustment", "detail", id],
    queryFn: () => StockAdjustmentService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useCreateStockAdjustment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: StockAdjustmentFormData) => StockAdjustmentService.create(data),
    onSuccess: () => {
      toast.success("Penyesuaian stok berhasil dibuat")
      qc.invalidateQueries({ queryKey: ["stock-adjustment"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal membuat penyesuaian stok"),
  })
}

export function useApproveStockAdjustment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, approvedBy }: { id: string; approvedBy: string }) =>
      StockAdjustmentService.approve(id, approvedBy),
    onSuccess: () => {
      toast.success("Penyesuaian stok berhasil disetujui")
      qc.invalidateQueries({ queryKey: ["stock-adjustment"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menyetujui penyesuaian stok"),
  })
}

export function useCancelStockAdjustment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: StockAdjustmentService.cancel,
    onSuccess: () => {
      toast.success("Penyesuaian stok berhasil dibatalkan")
      qc.invalidateQueries({ queryKey: ["stock-adjustment"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal membatalkan penyesuaian stok"),
  })
}

export function useDeleteStockAdjustment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: StockAdjustmentService.delete,
    onSuccess: () => {
      toast.success("Penyesuaian stok berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["stock-adjustment"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghapus penyesuaian stok"),
  })
}
