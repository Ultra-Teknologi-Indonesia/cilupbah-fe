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

export function useMoveToReady() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderIds: string[]) => OrderService.moveToReadyToProcess(orderIds),
    onSuccess: () => {
      toast.success("Pesanan berhasil dipindahkan ke Perlu Dikirim")
      qc.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (err: Error) => toast.error(err.message || "Gagal memindahkan pesanan"),
  })
}

export function useRequestAwb() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { orderId: string; courierCode?: string }) =>
      OrderService.requestAwb(data.orderId, data.courierCode),
    onSuccess: () => {
      toast.success("Nomor resi berhasil diminta")
      qc.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (err: Error) => toast.error(err.message || "Gagal meminta nomor resi"),
  })
}

export function useAcceptCancelRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => OrderService.acceptCancelRequest(orderId),
    onSuccess: () => {
      toast.success("Pembatalan pesanan berhasil diterima")
      qc.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (err: Error) => toast.error(err.message || "Gagal menerima pembatalan"),
  })
}

export function useRejectCancelRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => OrderService.rejectCancelRequest(orderId),
    onSuccess: () => {
      toast.success("Pembatalan pesanan berhasil ditolak")
      qc.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (err: Error) => toast.error(err.message || "Gagal menolak pembatalan"),
  })
}

export function useAcceptReturn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (returnId: string) => OrderService.acceptReturn(returnId),
    onSuccess: () => {
      toast.success("Retur berhasil diterima")
      qc.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (err: Error) => toast.error(err.message || "Gagal menerima retur"),
  })
}

export function useRejectReturn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { returnId: string; reason?: string }) =>
      OrderService.rejectReturn(data.returnId, data.reason),
    onSuccess: () => {
      toast.success("Retur berhasil ditolak")
      qc.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (err: Error) => toast.error(err.message || "Gagal menolak retur"),
  })
}
