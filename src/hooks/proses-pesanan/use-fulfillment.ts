"use client"

import { useQuery } from "@tanstack/react-query"

import { OutboundService } from "@/services/proses-pesanan/outbound.service"
import type { FulfillmentListParams } from "@/types/proses-pesanan/fulfillment"

const STALE = 30_000
const all = ["proses-pesanan"] as const

export const fulfillmentKeys = {
  all,
  picklists: (p: FulfillmentListParams) => [...all, "picklists", p] as const,
  packlists: (p: FulfillmentListParams) => [...all, "packlists", p] as const,
  shipments: (p: FulfillmentListParams) => [...all, "shipments", p] as const,
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
