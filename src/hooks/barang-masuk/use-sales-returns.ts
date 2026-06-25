"use client"

import { useQuery } from "@tanstack/react-query"
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
    queryFn: () => SalesReturnService.list(params),
    staleTime: STALE,
  })
}
