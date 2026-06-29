"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  OutboundService,
  type CreateShipmentPayload,
} from "@/services/proses-pesanan/outbound.service"
import type { FulfillmentListParams } from "@/types/proses-pesanan/fulfillment"

const STALE = 30_000
const all = ["proses-pesanan"] as const

export const fulfillmentKeys = {
  all,
  ordersByStage: (stage: string, p: FulfillmentListParams) =>
    [...all, "orders", stage, p] as const,
  picklists: (p: FulfillmentListParams) => [...all, "picklists", p] as const,
  packlists: (p: FulfillmentListParams) => [...all, "packlists", p] as const,
  shipments: (p: FulfillmentListParams) => [...all, "shipments", p] as const,
  pickers: (locationId?: string) => [...all, "pickers", locationId ?? ""] as const,
  count: (key: string) => [...all, "count", key] as const,
  picklistDetail: (id: string) => [...all, "picklist-detail", id] as const,
  packlistDetail: (id: string) => [...all, "packlist-detail", id] as const,
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

export function usePickers(locationId?: string, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.pickers(locationId),
    queryFn: () => OutboundService.pickers(locationId),
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
    queryFn: () => OutboundService.picklists({ per_page: 1 }).then((r) => r.meta.total),
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
    queryFn: () => OutboundService.packlists({ per_page: 1 }).then((r) => r.meta.total),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all }),
  })
}

export function useAssignPicker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ picklistId, pickerId }: { picklistId: string; pickerId: string }) =>
      OutboundService.assignPicker(picklistId, pickerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all }),
  })
}

export function useAssignPacker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ packlistId, packerId }: { packlistId: string; packerId: string }) =>
      OutboundService.assignPacker(packlistId, packerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all }),
  })
}

export function useReadyToShip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderIds: string[]) => OutboundService.readyToShip(orderIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all }),
  })
}

export function usePickItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      picklistId,
      itemId,
      qtyPicked,
      binId,
    }: {
      picklistId: string
      itemId: string
      qtyPicked: number
      binId?: string | null
    }) => OutboundService.pickItem(picklistId, itemId, { qty_picked: qtyPicked, bin_id: binId }),
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: fulfillmentKeys.picklistDetail(v.picklistId) }),
  })
}

export function useCompletePicklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => OutboundService.completePicklist(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all }),
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

export function useFailPicklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      OutboundService.failPicklist(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all }),
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
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: fulfillmentKeys.packlistDetail(v.packlistId) }),
  })
}

export function useCompletePacklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => OutboundService.completePacklist(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all }),
  })
}

export function useMarkComplete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderIds: string[]) => OutboundService.markComplete(orderIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all }),
  })
}

export function useCreateShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, orderIds }: { payload: CreateShipmentPayload; orderIds: string[] }) =>
      OutboundService.createShipmentWithOrders(payload, orderIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all }),
  })
}

export function useHandOverShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (shipmentId: string) => OutboundService.handOverShipment(shipmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all }),
  })
}

export function useCancelShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (shipmentId: string) => OutboundService.cancelShipment(shipmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all }),
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
