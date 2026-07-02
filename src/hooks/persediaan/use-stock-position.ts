"use client"

import { useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { InventoryStockService } from "@/services/persediaan/inventory.service"
import type { StockListParams, StockMovementParams } from "@/types/persediaan/stock"

const STALE = 30_000

const all = ["inventory"] as const

export const inventoryKeys = {
  all,
  list: (params: StockListParams) => [...all, "list", params] as const,
  item: (itemId: string) => [...all, "item", itemId] as const,
  movements: (params: StockMovementParams) => [...all, "movements", params] as const,
  itemStock: (itemId: string) => [...all, "item-stock", itemId] as const,
}

export function useStockPosition(params: StockListParams) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => InventoryStockService.list(params),
    staleTime: STALE,
  })
}

export function useStockItem(itemId: string) {
  return useQuery({
    queryKey: inventoryKeys.item(itemId),
    queryFn: () => InventoryStockService.getItem(itemId),
    staleTime: STALE,
    enabled: !!itemId,
  })
}

export function useStockMovements(params: StockMovementParams) {
  return useQuery({
    queryKey: inventoryKeys.movements(params),
    queryFn: () => InventoryStockService.movements(params),
    staleTime: STALE,
    enabled: !!params["filter[item_id]"],
  })
}

export function useItemStock(itemId: string) {
  return useQuery({
    queryKey: inventoryKeys.itemStock(itemId),
    queryFn: () => InventoryStockService.getItemStock(itemId),
    staleTime: STALE,
    enabled: !!itemId,
  })
}

// Hangatkan cache detail item (entitas utama + stok) saat hover, agar navigasi
// ke halaman detail terasa instan. Dipakai imperatif dari daftar posisi stok.
export function usePrefetchStockDetail() {
  const qc = useQueryClient()
  return useCallback(
    (itemId: string) => {
      qc.prefetchQuery({
        queryKey: inventoryKeys.item(itemId),
        queryFn: () => InventoryStockService.getItem(itemId),
        staleTime: STALE,
      })
      qc.prefetchQuery({
        queryKey: inventoryKeys.itemStock(itemId),
        queryFn: () => InventoryStockService.getItemStock(itemId),
        staleTime: STALE,
      })
    },
    [qc]
  )
}
