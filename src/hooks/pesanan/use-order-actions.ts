"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { OrderService, type ShippingLabelResult } from "@/services/pesanan/order.service"
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
      toast.success("Pesanan siap diproses oleh gudang.")
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

function openShippingLabel(result: ShippingLabelResult) {
  if (result.type === "url" && result.url) {
    triggerDownload(result.url, "shipping-label.pdf")
    return
  }
  if (result.type === "base64" && result.document_base64) {
    const contentType = result.content_type || "application/pdf"
    const byteChars = atob(result.document_base64)
    const byteArray = new Uint8Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) {
      byteArray[i] = byteChars.charCodeAt(i)
    }
    const blob = new Blob([byteArray], { type: contentType })
    const url = URL.createObjectURL(blob)
    const ext = contentType.includes("pdf") ? "pdf" : "bin"
    triggerDownload(url, `shipping-label.${ext}`)
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
    return
  }
  toast.info("Format label tidak dikenali")
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.target = "_blank"
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function useGetShippingLabel() {
  return useMutation({
    mutationFn: (data: { orderId: string; docType?: string }) =>
      OrderService.getShippingLabel(data.orderId, data.docType),
    onSuccess: (res) => {
      // BE returns HTTP 202 with { success:false, status:'preparing', message }
      // when PrepareShopeeShippingLabelJob masih jalan di background.
      const maybeStatus = (res as unknown as { status?: string })?.status
      if (maybeStatus === "preparing") {
        toast.warning(
          (res as unknown as { message?: string })?.message
            || "Label sedang disiapkan oleh Shopee, coba lagi 1-2 menit."
        )
        return
      }

      const result = res.data
      if (result) {
        openShippingLabel(result)
        if (result.requires_self_design) {
          toast.info(
            "Label custom (self-design) — marketplace tidak menyediakan PDF, "
              + "dibuat oleh sistem."
          )
        } else {
          toast.success("Shipping label berhasil diambil")
        }
      }
    },
    onError: (err: Error) => toast.error(err.message || "Gagal mengambil shipping label"),
  })
}

export function useRelocateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { orderId: string; locationId: string }) =>
      OrderService.relocateOrder(data.orderId, data.locationId),
    onSuccess: () => {
      toast.success("Lokasi pengambilan berhasil diubah")
      qc.invalidateQueries({ queryKey: orderKeys.all })
    },
    onError: (err: Error) => toast.error(err.message || "Gagal mengubah lokasi pengambilan"),
  })
}
