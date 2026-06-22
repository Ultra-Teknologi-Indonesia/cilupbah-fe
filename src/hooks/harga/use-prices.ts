"use client"

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { PriceService } from "@/services/harga/price.service"
import type {
  OnlinePriceListParams,
  OfflinePriceListParams,
  UpdateOnlinePriceItem,
  UpdateOfflinePriceItem,
} from "@/types/harga/price"

export const priceKeys = {
  all: ["harga"] as const,
  online: (params: OnlinePriceListParams) => [...priceKeys.all, "online", params] as const,
  offline: (params: OfflinePriceListParams) => [...priceKeys.all, "offline", params] as const,
}

export function useOnlinePrices(params: OnlinePriceListParams = {}) {
  return useQuery({
    queryKey: priceKeys.online(params),
    queryFn: () => PriceService.online(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}

export function useOfflinePrices(params: OfflinePriceListParams = {}) {
  return useQuery({
    queryKey: priceKeys.offline(params),
    queryFn: () => PriceService.offline(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}

export function useUpdateOnlinePrices() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: UpdateOnlinePriceItem[]) => PriceService.updateOnline(items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...priceKeys.all, "online"] })
    },
  })
}

export function useUpdateOfflinePrices() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: UpdateOfflinePriceItem[]) => PriceService.updateOffline(items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...priceKeys.all, "offline"] })
    },
  })
}
