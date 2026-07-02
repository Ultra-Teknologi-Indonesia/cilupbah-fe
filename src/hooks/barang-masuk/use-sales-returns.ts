"use client"

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { SalesReturnService } from "@/services/barang-masuk/sales-return.service"
import type { SalesReturnListParams } from "@/types/barang-masuk/sales-return"

const STALE = 30 * 1000

export function useSalesReturnsUnprocessed(params: SalesReturnListParams = {}) {
  return useQuery({
    queryKey: ["sales-return", "unprocessed", params],
    queryFn: () => SalesReturnService.unprocessed(params),
    staleTime: STALE,
  })
}

export function useSalesReturns(params: SalesReturnListParams = {}) {
  return useQuery({
    queryKey: ["sales-return", "list", params],
    placeholderData: keepPreviousData,
    queryFn: () => SalesReturnService.list(params),
    staleTime: STALE,
  })
}

export function useSalesReturn(id: string, enabled = true) {
  return useQuery({
    queryKey: ["sales-return", "detail", id],
    queryFn: () => SalesReturnService.getById(id),
    enabled: enabled && !!id,
    staleTime: STALE,
  })
}
