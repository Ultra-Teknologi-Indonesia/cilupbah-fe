"use client"

import { useQuery } from "@tanstack/react-query"

import { InventoryService } from "@/services/master-produk/inventory.service"

/** Ambil stok varian secara lazy (mis. saat baris diperluas / detail dibuka). */
export function useVariantStocks(itemIds: string[], enabled = true) {
  return useQuery({
    queryKey: ["master-produk", "stocks", [...itemIds].sort()],
    queryFn: () => InventoryService.getVariantStocks(itemIds),
    enabled: enabled && itemIds.length > 0,
    staleTime: 30 * 1000,
  })
}
