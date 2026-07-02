"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { OrderService, type ShippingLabelResult } from "@/services/pesanan/order.service"
import { createMutationHook } from "@/hooks/create-crud-hooks"
import { orderKeys } from "./use-orders"

// Invalidasi granular: mutasi status menyasar list + badge counts + detail
// pesanan terdampak — bukan orderKeys.all yang menyeret semua query modul.
const listAndCounts = [orderKeys.lists, orderKeys.counts] as const

const forOrder = (orderId: string) => [...listAndCounts, orderKeys.detail(orderId)]
const forBulk = () => [...listAndCounts, orderKeys.details]

export const useSetPaid = createMutationHook({
  mutationFn: (data: { orderId: string; paymentMethod?: string }) =>
    OrderService.setPaid(data.orderId, { payment_method: data.paymentMethod }),
  successMessage: "Pesanan berhasil ditandai dibayar",
  errorMessage: "Gagal mengubah status pembayaran",
  invalidates: ({ orderId }) => forOrder(orderId),
})

export const useCancelOrder = createMutationHook({
  mutationFn: (data: { orderId: string; reason?: string }) =>
    OrderService.cancelOrder(data.orderId, data.reason),
  successMessage: "Pesanan berhasil dibatalkan",
  errorMessage: "Gagal membatalkan pesanan",
  invalidates: ({ orderId }) => forOrder(orderId),
})

export const useSaveAirwaybill = createMutationHook({
  mutationFn: (data: { orderId: string; trackingNumber: string; provider?: string }) =>
    OrderService.saveAirwaybill(data.orderId, data.trackingNumber, data.provider),
  successMessage: "Nomor resi berhasil disimpan",
  errorMessage: "Gagal menyimpan nomor resi",
  invalidates: ({ orderId }) => forOrder(orderId),
})

export const useMarkComplete = createMutationHook({
  mutationFn: (orderIds: string[]) => OrderService.markAsComplete(orderIds),
  successMessage: "Pesanan berhasil diselesaikan",
  errorMessage: "Gagal menyelesaikan pesanan",
  invalidates: forBulk,
})

export const useDeleteCancelled = createMutationHook({
  mutationFn: (ids: string[]) => OrderService.deleteCancelled(ids),
  successMessage: "Pesanan yang dibatalkan berhasil dihapus",
  errorMessage: "Gagal menghapus pesanan",
  invalidates: forBulk,
})

export const useMoveToReady = createMutationHook({
  mutationFn: (orderIds: string[]) => OrderService.moveToReadyToProcess(orderIds),
  successMessage: "Pesanan siap diproses oleh gudang.",
  errorMessage: "Gagal memindahkan pesanan",
  invalidates: forBulk,
})

export const useRequestAwb = createMutationHook({
  mutationFn: (data: { orderId: string; courierCode?: string }) =>
    OrderService.requestAwb(data.orderId, data.courierCode),
  successMessage: "Nomor resi berhasil diminta",
  errorMessage: "Gagal meminta nomor resi",
  invalidates: ({ orderId }) => forOrder(orderId),
})

export const useAcceptCancelRequest = createMutationHook({
  mutationFn: (orderId: string) => OrderService.acceptCancelRequest(orderId),
  successMessage: "Pembatalan pesanan berhasil diterima",
  errorMessage: "Gagal menerima pembatalan",
  invalidates: (orderId) => forOrder(orderId),
})

export const useRejectCancelRequest = createMutationHook({
  mutationFn: (orderId: string) => OrderService.rejectCancelRequest(orderId),
  successMessage: "Pembatalan pesanan berhasil ditolak",
  errorMessage: "Gagal menolak pembatalan",
  invalidates: (orderId) => forOrder(orderId),
})

export const useAcceptReturn = createMutationHook({
  mutationFn: (returnId: string) => OrderService.acceptReturn(returnId),
  successMessage: "Retur berhasil diterima",
  errorMessage: "Gagal menerima retur",
  // returnId ≠ orderId — detail pesanan terkait tidak bisa ditarget langsung.
  invalidates: forBulk,
})

export const useRejectReturn = createMutationHook({
  mutationFn: (data: { returnId: string; reason?: string }) =>
    OrderService.rejectReturn(data.returnId, data.reason),
  successMessage: "Retur berhasil ditolak",
  errorMessage: "Gagal menolak retur",
  invalidates: forBulk,
})

export const useRelocateOrder = createMutationHook({
  mutationFn: (data: { orderId: string; locationId: string }) =>
    OrderService.relocateOrder(data.orderId, data.locationId),
  successMessage: "Lokasi pengambilan berhasil diubah",
  errorMessage: "Gagal mengubah lokasi pengambilan",
  invalidates: ({ orderId }) => forOrder(orderId),
})

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

// Bukan kandidat factory: tanpa invalidasi, onSuccess-nya alur unduh + status
// "preparing" khusus Shopee.
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
