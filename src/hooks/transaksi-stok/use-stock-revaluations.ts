"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { StockRevaluationService } from "@/services/transaksi-stok/stock-revaluation.service"
import type { StockRevaluationListParams, StockRevaluationFormData } from "@/types/transaksi-stok/stock-revaluation"

const STALE = 30 * 1000

export function useStockRevaluations(params: StockRevaluationListParams = {}) {
  return useQuery({
    queryKey: ["stock-revaluation", "list", params],
    queryFn: () => StockRevaluationService.list(params),
    staleTime: STALE,
  })
}

export function useStockRevaluationDetail(id?: string) {
  return useQuery({
    queryKey: ["stock-revaluation", "detail", id],
    queryFn: () => StockRevaluationService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useCreateStockRevaluation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: StockRevaluationFormData) => StockRevaluationService.create(data),
    onSuccess: () => {
      toast.success("Revaluasi stok berhasil dibuat")
      qc.invalidateQueries({ queryKey: ["stock-revaluation"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal membuat revaluasi stok"),
  })
}

export function useCancelStockRevaluation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: StockRevaluationService.cancel,
    onSuccess: () => {
      toast.success("Revaluasi stok berhasil dibatalkan")
      qc.invalidateQueries({ queryKey: ["stock-revaluation"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal membatalkan revaluasi stok"),
  })
}
