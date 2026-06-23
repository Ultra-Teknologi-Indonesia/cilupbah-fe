"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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
      picker_id?: string | null
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
