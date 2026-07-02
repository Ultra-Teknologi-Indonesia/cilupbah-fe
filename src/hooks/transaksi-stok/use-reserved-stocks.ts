"use client"

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { toast } from "sonner"
import { ReservedStockService } from "@/services/transaksi-stok/reserved-stock.service"
import type { ReservedStockListParams, ReservedStockFormData } from "@/types/transaksi-stok/reserved-stock"

const STALE = 30 * 1000

export function useReservedStocks(params: ReservedStockListParams = {}) {
  return useQuery({
    queryKey: ["reserved-stock", "list", params],
    placeholderData: keepPreviousData,
    queryFn: () => ReservedStockService.list(params),
    staleTime: STALE,
  })
}

export function useReservedStockDetail(id?: string) {
  return useQuery({
    queryKey: ["reserved-stock", "detail", id],
    queryFn: () => ReservedStockService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useCreateReservedStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ReservedStockFormData) => ReservedStockService.create(data),
    onSuccess: () => {
      toast.success("Stok cadangan berhasil dibuat")
      qc.invalidateQueries({ queryKey: ["reserved-stock"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal membuat stok cadangan"),
  })
}

export function useCancelReservedStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ReservedStockService.cancel,
    onSuccess: () => {
      toast.success("Stok cadangan berhasil dibatalkan")
      qc.invalidateQueries({ queryKey: ["reserved-stock"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal membatalkan stok cadangan"),
  })
}
