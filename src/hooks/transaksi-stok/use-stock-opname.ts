"use client"

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { toast } from "sonner"
import { StockOpnameService } from "@/services/transaksi-stok/stock-opname.service"
import type { StockOpnameListParams, StockOpnameFormData } from "@/types/transaksi-stok/stock-opname"

const STALE = 30 * 1000

export function useStockOpnames(params: StockOpnameListParams = {}) {
  return useQuery({
    queryKey: ["stock-opname", "list", params],
    placeholderData: keepPreviousData,
    queryFn: () => StockOpnameService.list(params),
    staleTime: STALE,
  })
}

export function useStockOpnameDetail(id?: string) {
  return useQuery({
    queryKey: ["stock-opname", "detail", id],
    queryFn: () => StockOpnameService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useStockOpnameItems(id: string, params: { page?: number; per_page?: number; search?: string } = {}) {
  return useQuery({
    queryKey: ["stock-opname", "items", id, params],
    queryFn: () => StockOpnameService.getItems(id, params),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useCreateStockOpname() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: StockOpnameFormData) => StockOpnameService.create(data),
    onSuccess: () => {
      toast.success("Stock opname berhasil dibuat")
      qc.invalidateQueries({ queryKey: ["stock-opname"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal membuat stock opname"),
  })
}

export function useStartStockOpname() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, processBy }: { id: string; processBy: string }) =>
      StockOpnameService.start(id, processBy),
    onSuccess: () => {
      toast.success("Proses opname dimulai")
      qc.invalidateQueries({ queryKey: ["stock-opname"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memulai opname"),
  })
}

export function useCountOpnameItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ opnameId, itemId, data }: { opnameId: string; itemId: string; data: { qty_actual: number; reason?: string; counted_by: string } }) =>
      StockOpnameService.countItem(opnameId, itemId, data),
    onSuccess: () => {
      toast.success("Item berhasil dihitung")
      qc.invalidateQueries({ queryKey: ["stock-opname"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghitung item"),
  })
}

export function useFinalizeStockOpname() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, finalizedBy }: { id: string; finalizedBy: string }) =>
      StockOpnameService.finalize(id, finalizedBy),
    onSuccess: () => {
      toast.success("Stock opname berhasil difinalisasi")
      qc.invalidateQueries({ queryKey: ["stock-opname"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memfinalisasi opname"),
  })
}

export function useCancelStockOpname() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: StockOpnameService.cancel,
    onSuccess: () => {
      toast.success("Stock opname berhasil dibatalkan")
      qc.invalidateQueries({ queryKey: ["stock-opname"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal membatalkan opname"),
  })
}

export function useDeleteStockOpname() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: StockOpnameService.delete,
    onSuccess: () => {
      toast.success("Stock opname berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["stock-opname"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghapus opname"),
  })
}
