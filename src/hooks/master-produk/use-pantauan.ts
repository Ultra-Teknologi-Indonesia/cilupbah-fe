"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import {
  PantauanService,
  type PantauanParams,
} from "@/services/master-produk/pantauan.service"

export const pantauanKey = (params: PantauanParams) =>
  ["master-produk", "pantauan", params] as const

export function usePantauan(params: PantauanParams) {
  return useQuery({
    queryKey: pantauanKey(params),
    queryFn: () => PantauanService.list(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}
