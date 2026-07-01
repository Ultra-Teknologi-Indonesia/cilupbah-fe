"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  OutboundService,
  type CreateShipmentPayload,
} from "@/services/proses-pesanan/outbound.service"
import type {
  FulfillmentListParams,
  PicklistDetail,
  PacklistDetail,
} from "@/types/proses-pesanan/fulfillment"

const STALE = 30_000
const all = ["proses-pesanan"] as const
// Data "papan kerja": list per-stage + badge count. Ini yang berubah tiap ada
// mutasi status pesanan, jadi invalidasi mutasi cukup menyasar prefix ini —
// bukan `all` yang juga menyeret data referensi (pickers/couriers) & detail.
const board = [...all, "board"] as const

export const fulfillmentKeys = {
  all,
  board,
  ordersByStage: (stage: string, p: FulfillmentListParams) =>
    [...board, "orders", stage, p] as const,
  picklists: (p: FulfillmentListParams) => [...board, "picklists", p] as const,
  packlists: (p: FulfillmentListParams) => [...board, "packlists", p] as const,
  shipments: (p: FulfillmentListParams) => [...board, "shipments", p] as const,
  count: (key: string) => [...board, "count", key] as const,
  pickers: (locationId?: string, role?: string) => [...all, "pickers", locationId ?? "", role ?? ""] as const,
  picklistDetail: (id: string) => [...all, "picklist-detail", id] as const,
  packlistDetail: (id: string) => [...all, "packlist-detail", id] as const,
  shipmentDetail: (id: string) => [...all, "shipment-detail", id] as const,
}

// ── Queries ──────────────────────────────────────────────────────────────────
export function useOrdersByStage(
  stage: string,
  params: FulfillmentListParams,
  enabled = true
) {
  return useQuery({
    queryKey: fulfillmentKeys.ordersByStage(stage, params),
    queryFn: () => OutboundService.ordersByStage(stage, params),
    staleTime: STALE,
    enabled,
  })
}

export function usePicklists(params: FulfillmentListParams, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.picklists(params),
    queryFn: () => OutboundService.picklists(params),
    staleTime: STALE,
    enabled,
  })
}

export function usePacklists(params: FulfillmentListParams, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.packlists(params),
    queryFn: () => OutboundService.packlists(params),
    staleTime: STALE,
    enabled,
  })
}

export function useShipments(params: FulfillmentListParams, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.shipments(params),
    queryFn: () => OutboundService.shipments(params),
    staleTime: STALE,
    enabled,
  })
}

export function usePickers(locationId?: string, role?: string, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.pickers(locationId, role),
    queryFn: () => OutboundService.pickers(locationId, role),
    staleTime: 60_000,
    enabled,
  })
}

export function useCouriers(enabled = true) {
  return useQuery({
    queryKey: [...all, "couriers"],
    queryFn: () => OutboundService.couriersAll(),
    staleTime: 5 * 60_000,
    enabled,
  })
}

// Hitung jumlah untuk badge sub-status (per-stage total / picklist IN_PROGRESS total).
export function usePickingCounts() {
  const belum = useQuery({
    queryKey: fulfillmentKeys.count("picking-belum"),
    queryFn: () =>
      OutboundService.ordersByStage("ready-to-process", { per_page: 1 }).then((r) => r.meta.total),
    staleTime: STALE,
  })
  const diproses = useQuery({
    queryKey: fulfillmentKeys.count("picking-diproses"),
    queryFn: () => OutboundService.picklists({ per_page: 1, status: "DRAFT,IN_PROGRESS" }).then((r) => r.meta.total),
    staleTime: STALE,
  })
  const selesai = useQuery({
    queryKey: fulfillmentKeys.count("picking-selesai"),
    queryFn: () =>
      OutboundService.ordersByStage("finish-pick", { per_page: 1 }).then((r) => r.meta.total),
    staleTime: STALE,
  })
  return {
    belum: belum.data,
    diproses: diproses.data,
    selesai: selesai.data,
  }
}

export function usePackingCounts() {
  const belum = useQuery({
    queryKey: fulfillmentKeys.count("packing-belum"),
    queryFn: () =>
      OutboundService.ordersByStage("finish-pick", { per_page: 1 }).then((r) => r.meta.total),
    staleTime: STALE,
  })
  const diproses = useQuery({
    queryKey: fulfillmentKeys.count("packing-diproses"),
    queryFn: () => OutboundService.packlists({ per_page: 1, status: "DRAFT,IN_PROGRESS" }).then((r) => r.meta.total),
    staleTime: STALE,
  })
  const selesai = useQuery({
    queryKey: fulfillmentKeys.count("packing-selesai"),
    queryFn: () =>
      OutboundService.ordersByStage("finish-pack", { per_page: 1 }).then((r) => r.meta.total),
    staleTime: STALE,
  })
  return {
    belum: belum.data,
    diproses: diproses.data,
    selesai: selesai.data,
  }
}

// ── Mutations ────────────────────────────────────────────────────────────────
export function useCreatePicklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      order_ids: string[]
      location_id: string
      picker_id: string
      notes?: string | null
    }) => OutboundService.createPicklist(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  })
}

export function useAssignPicker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ picklistId, pickerId }: { picklistId: string; pickerId: string }) =>
      OutboundService.assignPicker(picklistId, pickerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  })
}

export function useAssignPacker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ packlistId, packerId }: { packlistId: string; packerId: string }) =>
      OutboundService.assignPacker(packlistId, packerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  })
}

export function useReadyToShip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderIds: string[]) => OutboundService.readyToShip(orderIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  })
}

// ── Scan/pick detail (Picking) ───────────────────────────────────────────────
export function usePicklistDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.picklistDetail(id),
    queryFn: () => OutboundService.picklistDetail(id),
    enabled: enabled && !!id,
  })
}

export function useStartPicklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => OutboundService.startPicklist(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board })
      qc.invalidateQueries({ queryKey: fulfillmentKeys.picklistDetail(id) })
    },
  })
}

export function usePickItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      picklistId,
      itemId,
      qtyPicked,
      binCode,
    }: {
      picklistId: string
      itemId: string
      qtyPicked: number
      binCode: string
    }) => OutboundService.pickItem(picklistId, itemId, { qty_picked: qtyPicked, bin_code: binCode }),
    // Optimistic: qtyPicked adalah nilai absolut, jadi langsung patch item di
    // cache detail → progress scan naik seketika tanpa nunggu POST + refetch.
    // onSettled tetap invalidasi agar field turunan dari server (status item,
    // dsb.) direkonsiliasi di background.
    onMutate: async (v) => {
      const key = fulfillmentKeys.picklistDetail(v.picklistId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<PicklistDetail>(key)
      if (prev) {
        qc.setQueryData<PicklistDetail>(key, {
          ...prev,
          items: prev.items.map((it) =>
            it.id === v.itemId
              ? { ...it, qtyPicked: v.qtyPicked, binCode: v.binCode || it.binCode }
              : it
          ),
        })
      }
      return { key, prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev)
    },
    onSettled: (_d, _e, v) =>
      qc.invalidateQueries({ queryKey: fulfillmentKeys.picklistDetail(v.picklistId) }),
  })
}

export function useCompletePicklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => OutboundService.completePicklist(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board })
      qc.invalidateQueries({ queryKey: fulfillmentKeys.picklistDetail(id) })
    },
  })
}

// Download PDF picklist sebagai file (filename pakai picklistNo bila tersedia,
// fallback ke `PICK-{id}.pdf`). Trigger anchor click programmatic.
export function useDownloadPicklistPdf() {
  return useMutation({
    mutationFn: async ({
      picklistId,
      picklistNo,
    }: {
      picklistId: string
      picklistNo?: string | null
    }) => {
      const blob = await OutboundService.picklistPdf(picklistId)
      const filename = picklistNo ? `${picklistNo}.pdf` : `PICK-${picklistId}.pdf`
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      return filename
    },
    onSuccess: (filename) => {
      toast.success(`Picklist ${filename} berhasil diunduh`)
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Gagal mengunduh PDF picklist."
      toast.error(msg)
    },
  })
}

// ── Ad-hoc pick (tanpa picklist) ────────────────────────────────────────────
export function useAdHocPick() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      order_id: string
      items?: Array<{ order_item_id: string; qty_picked: number; bin_id?: string | null }>
    }) => OutboundService.adHocPick(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  })
}

export function useAdHocPickScan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      order_id: string
      sku: string
      qty?: number
      bin_id?: string | null
    }) => OutboundService.adHocPickScan(payload),
    onSuccess: (_d, _v) => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board })
    },
  })
}

export function useFailPicklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      OutboundService.failPicklist(id, reason),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board })
      qc.invalidateQueries({ queryKey: fulfillmentKeys.picklistDetail(v.id) })
    },
  })
}

// ── Scan order for packing ──────────────────────────────────────────────────
export function useScanOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderNo, packerId }: { orderNo: string; packerId?: string | null }) =>
      OutboundService.scanOrder(orderNo, packerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  })
}

// ── Scan/pack detail (Packing) ───────────────────────────────────────────────
export function usePacklistDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.packlistDetail(id),
    queryFn: () => OutboundService.packlistDetail(id),
    enabled: enabled && !!id,
  })
}

export function useStartPacklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => OutboundService.startPacklist(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board })
      qc.invalidateQueries({ queryKey: fulfillmentKeys.packlistDetail(id) })
    },
  })
}

export function useVerifyBarcode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ packlistId, barcode }: { packlistId: string; barcode: string }) =>
      OutboundService.verifyBarcode(packlistId, barcode),
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: fulfillmentKeys.packlistDetail(v.packlistId) }),
  })
}

export function usePackItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      packlistId,
      itemId,
      qtyPacked,
      barcodeVerified,
    }: {
      packlistId: string
      itemId: string
      qtyPacked: number
      barcodeVerified?: boolean
    }) =>
      OutboundService.packItem(packlistId, itemId, {
        qty_packed: qtyPacked,
        barcode_verified: barcodeVerified,
      }),
    // Optimistic sama seperti pickItem: qtyPacked absolut → patch seketika.
    onMutate: async (v) => {
      const key = fulfillmentKeys.packlistDetail(v.packlistId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<PacklistDetail>(key)
      if (prev) {
        qc.setQueryData<PacklistDetail>(key, {
          ...prev,
          items: prev.items.map((it) =>
            it.id === v.itemId
              ? {
                  ...it,
                  qtyPacked: v.qtyPacked,
                  barcodeVerified: v.barcodeVerified ?? it.barcodeVerified,
                }
              : it
          ),
        })
      }
      return { key, prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev)
    },
    onSettled: (_d, _e, v) =>
      qc.invalidateQueries({ queryKey: fulfillmentKeys.packlistDetail(v.packlistId) }),
  })
}

export function useCompletePacklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => OutboundService.completePacklist(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board })
      qc.invalidateQueries({ queryKey: fulfillmentKeys.packlistDetail(id) })
    },
  })
}

export function useMarkComplete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderIds: string[]) => OutboundService.markComplete(orderIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  })
}

export function useCreateShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, orderIds }: { payload: CreateShipmentPayload; orderIds: string[] }) =>
      OutboundService.createShipmentWithOrders(payload, orderIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  })
}

export function useHandOverShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (shipmentId: string) => OutboundService.handOverShipment(shipmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  })
}

export function useCancelShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (shipmentId: string) => OutboundService.cancelShipment(shipmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  })
}

export function useShipmentDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.shipmentDetail(id),
    queryFn: () => OutboundService.shipmentDetail(id),
    enabled: enabled && !!id,
  })
}

export function useScanOrderToShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ shipmentId, barcode }: { shipmentId: string; barcode: string }) =>
      OutboundService.scanOrderToShipment(shipmentId, barcode),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.shipmentDetail(v.shipmentId) })
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board })
    },
  })
}

export function useRemoveOrderFromShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ shipmentId, orderIds }: { shipmentId: string; orderIds: string[] }) =>
      OutboundService.removeOrderFromShipment(shipmentId, orderIds),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.shipmentDetail(v.shipmentId) })
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board })
    },
  })
}

export function useShippingCounts() {
  const siapKirim = useQuery({
    queryKey: fulfillmentKeys.count("shipping-siap-kirim"),
    queryFn: () =>
      OutboundService.ordersByStage("finish-pack", { per_page: 1 }).then((r) => r.meta.total),
    staleTime: STALE,
  })
  const jadwal = useQuery({
    queryKey: fulfillmentKeys.count("shipping-jadwal"),
    queryFn: () =>
      OutboundService.shipments({ status: "SCHEDULED", per_page: 1 }).then((r) => r.meta.total),
    staleTime: STALE,
  })
  return { "siap-kirim": siapKirim.data, jadwal: jadwal.data }
}
