"use client"

import { useQuery } from "@tanstack/react-query"

import { OrderService } from "@/services/pesanan/order.service"
import type { OrderListParams } from "@/types/pesanan/order"

const STALE = 30_000

export const orderKeys = {
  all: ["pesanan"] as const,
  list: (params: OrderListParams) => [...orderKeys.all, "list", params] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
  counts: [...orderKeys.all, "counts"] as const,
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
