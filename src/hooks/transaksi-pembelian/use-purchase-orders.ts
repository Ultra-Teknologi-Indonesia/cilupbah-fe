"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PurchaseOrderService } from "@/services/transaksi-pembelian/purchase-order.service"
import type { PurchaseOrderListParams, PurchaseOrderFormData } from "@/types/transaksi-pembelian/purchase-order"

const STALE = 30 * 1000

export function usePurchaseOrders(params: PurchaseOrderListParams = {}) {
  return useQuery({
    queryKey: ["purchase-order", "list", params],
    queryFn: () => PurchaseOrderService.list(params),
    staleTime: STALE,
  })
}

export function usePurchaseOrderDetail(id?: string) {
  return useQuery({
    queryKey: ["purchase-order", "detail", id],
    queryFn: () => PurchaseOrderService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function usePurchaseOrderItems(id?: string, params: { page: number; perPage: number } = { page: 1, perPage: 10 }) {
  return useQuery({
    queryKey: ["purchase-order", "items", id, params],
    queryFn: () => PurchaseOrderService.getItems(id!, params),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: PurchaseOrderService.create,
    onSuccess: () => {
      toast.success("Pesanan pembelian berhasil dibuat")
      qc.invalidateQueries({ queryKey: ["purchase-order"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal membuat pesanan"),
  })
}

export function useUpdatePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchaseOrderFormData }) =>
      PurchaseOrderService.update(id, data),
    onSuccess: () => {
      toast.success("Pesanan pembelian berhasil diperbarui")
      qc.invalidateQueries({ queryKey: ["purchase-order"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memperbarui pesanan"),
  })
}

export function useApprovePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: PurchaseOrderService.approve,
    onSuccess: () => {
      toast.success("Pesanan berhasil diapprove")
      qc.invalidateQueries({ queryKey: ["purchase-order"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal approve pesanan"),
  })
}

export function useCancelPurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: PurchaseOrderService.cancel,
    onSuccess: () => {
      toast.success("Pesanan berhasil dibatalkan")
      qc.invalidateQueries({ queryKey: ["purchase-order"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal membatalkan pesanan"),
  })
}

export function useBulkDeletePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: PurchaseOrderService.bulkDelete,
    onSuccess: () => {
      toast.success("Pesanan terpilih berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["purchase-order"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghapus pesanan"),
  })
}

export function useDeletePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: PurchaseOrderService.delete,
    onSuccess: () => {
      toast.success("Pesanan berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["purchase-order"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghapus pesanan"),
  })
}
