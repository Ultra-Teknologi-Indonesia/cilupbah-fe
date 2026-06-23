"use client"

import { useQuery } from "@tanstack/react-query"

import { OrderService } from "@/services/pesanan/order.service"
import type { OrderListParams } from "@/types/pesanan/order"

const STALE = 30_000

const all = ["pesanan"] as const

export const orderKeys = {
  all,
  list: (params: OrderListParams) => [...all, "list", params] as const,
  detail: (id: string) => [...all, "detail", id] as const,
  counts: [...all, "counts"] as const,
}

export function useOrders(params: OrderListParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => OrderService.list(params),
    staleTime: STALE,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => OrderService.getById(id),
    enabled: !!id,
  })
}

export function useOrderCounts() {
  return useQuery({
    queryKey: orderKeys.counts,
    queryFn: () => OrderService.getCounts(),
    staleTime: STALE,
  })
}
