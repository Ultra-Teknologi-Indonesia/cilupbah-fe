"use client"

import { useQuery } from "@tanstack/react-query"
import { PutawayService } from "@/services/barang-masuk/putaway.service"
import type { PutawayListParams } from "@/types/barang-masuk/putaway"

const STALE = 30 * 1000

export function usePutaways(params: PutawayListParams = {}) {
  return useQuery({
    queryKey: ["putaway", "list", params],
    queryFn: () => PutawayService.list(params),
    staleTime: STALE,
  })
}
