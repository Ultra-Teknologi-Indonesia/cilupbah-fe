"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { OrderService } from "@/services/pesanan/order.service"
import { orderKeys } from "./use-orders"

export function useSetPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { orderId: string; paymentMethod?: string }) =>
      OrderService.setPaid(data.orderId, { payment_method: data.paymentMethod }),
    onSuccess: () => {
      toast.success("Pesanan berhasil ditandai dibayar")
      qc.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (err: Error) => toast.error(err.message || "Gagal mengubah status pembayaran"),
  })
}

export function useCancelOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { orderId: string; reason?: string }) =>
      OrderService.cancelOrder(data.orderId, data.reason),
    onSuccess: () => {
      toast.success("Pesanan berhasil dibatalkan")
      qc.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (err: Error) => toast.error(err.message || "Gagal membatalkan pesanan"),
  })
}

export function useSaveAirwaybill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { orderId: string; trackingNumber: string; provider?: string }) =>
      OrderService.saveAirwaybill(data.orderId, data.trackingNumber, data.provider),
    onSuccess: () => {
      toast.success("Nomor resi berhasil disimpan")
      qc.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (err: Error) => toast.error(err.message || "Gagal menyimpan nomor resi"),
  })
}

export function useMarkComplete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderIds: string[]) => OrderService.markAsComplete(orderIds),
    onSuccess: () => {
      toast.success("Pesanan berhasil diselesaikan")
      qc.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (err: Error) => toast.error(err.message || "Gagal menyelesaikan pesanan"),
  })
}

export function useDeleteCancelled() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => OrderService.deleteCancelled(ids),
    onSuccess: () => {
      toast.success("Pesanan yang dibatalkan berhasil dihapus")
      qc.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (err: Error) => toast.error(err.message || "Gagal menghapus pesanan"),
  })
}
