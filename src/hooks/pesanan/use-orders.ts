"use client"

import { useQuery } from "@tanstack/react-query"

import { OrderService } from "@/services/pesanan/order.service"
import type { OrderListParams } from "@/types/pesanan/order"
import { createDetailHook, createListHook, createResourceKeys } from "@/hooks/create-crud-hooks"

const STALE = 30_000

// Shape key dipertahankan (["pesanan","list",params] dst) — halaman prefetch
// RSC (app/dashboard/pesanan/page.tsx) menulisnya literal.
export const orderKeys = {
  ...createResourceKeys("pesanan"),
  counts: ["pesanan", "counts"] as const,
}

export const useOrders = createListHook(
  orderKeys,
  (params: OrderListParams) => OrderService.list(params)
)

export const useOrder = createDetailHook(orderKeys, (id: string) => OrderService.getById(id))

export function useOrderCounts() {
  return useQuery({
    queryKey: orderKeys.counts,
    queryFn: () => OrderService.getCounts(),
    staleTime: STALE,
  })
}
