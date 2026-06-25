"use client"

import { useQuery } from "@tanstack/react-query"
import { InboundService } from "@/services/barang-masuk/inbound.service"
import type { InboundListParams } from "@/types/barang-masuk/inbound"

const STALE = 30 * 1000

export function useInbounds(params: InboundListParams = {}) {
  return useQuery({
    queryKey: ["inbound", "list", params],
    queryFn: () => InboundService.list(params),
    staleTime: STALE,
  })
}

export function useInboundDetail(id?: string) {
  return useQuery({
    queryKey: ["inbound", "detail", id],
    queryFn: () => InboundService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  })
}
