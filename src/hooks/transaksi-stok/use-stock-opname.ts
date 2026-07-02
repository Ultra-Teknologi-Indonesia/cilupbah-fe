"use client"

import { useQuery } from "@tanstack/react-query"

import { StockOpnameService } from "@/services/transaksi-stok/stock-opname.service"
import type { StockOpnameListParams, StockOpnameFormData } from "@/types/transaksi-stok/stock-opname"
import {
  createDetailHook,
  createListHook,
  createMutationHook,
  createResourceKeys,
} from "@/hooks/create-crud-hooks"

const STALE = 30 * 1000

export const stockOpnameKeys = {
  ...createResourceKeys("stock-opname"),
  items: (id: string, params: unknown) => ["stock-opname", "items", id, params] as const,
  itemsOf: (id: string) => ["stock-opname", "items", id] as const,
}

export const useStockOpnames = createListHook(
  stockOpnameKeys,
  (params: StockOpnameListParams = {}) => StockOpnameService.list(params)
)

export const useStockOpnameDetail = createDetailHook(
  stockOpnameKeys,
  (id: string) => StockOpnameService.getById(id)
)

export function useStockOpnameItems(
  id: string,
  params: { page?: number; per_page?: number; search?: string } = {}
) {
  return useQuery({
    queryKey: stockOpnameKeys.items(id, params),
    queryFn: () => StockOpnameService.getItems(id, params),
    enabled: !!id,
    staleTime: STALE,
  })
}

export const useCreateStockOpname = createMutationHook({
  mutationFn: (data: StockOpnameFormData) => StockOpnameService.create(data),
  successMessage: "Stok opname berhasil dibuat",
  errorMessage: "Gagal membuat stok opname",
  invalidates: () => [stockOpnameKeys.lists],
})

export const useStartStockOpname = createMutationHook({
  mutationFn: ({ id, processBy }: { id: string; processBy: string }) =>
    StockOpnameService.start(id, processBy),
  successMessage: "Proses stok opname dimulai",
  errorMessage: "Gagal memulai stok opname",
  invalidates: ({ id }) => [stockOpnameKeys.lists, stockOpnameKeys.detail(id)],
})

export const useCountOpnameItem = createMutationHook({
  mutationFn: ({
    opnameId,
    itemId,
    data,
  }: {
    opnameId: string
    itemId: string
    data: { qty_actual: number; reason?: string; counted_by: string }
  }) => StockOpnameService.countItem(opnameId, itemId, data),
  successMessage: "Item berhasil dihitung",
  errorMessage: "Gagal menghitung item",
  invalidates: ({ opnameId }) => [
    stockOpnameKeys.detail(opnameId),
    stockOpnameKeys.itemsOf(opnameId),
  ],
})

export const useFinalizeStockOpname = createMutationHook({
  mutationFn: ({ id, finalizedBy }: { id: string; finalizedBy: string }) =>
    StockOpnameService.finalize(id, finalizedBy),
  successMessage: "Stok opname berhasil difinalisasi",
  errorMessage: "Gagal memfinalisasi stok opname",
  invalidates: ({ id }) => [
    stockOpnameKeys.lists,
    stockOpnameKeys.detail(id),
    stockOpnameKeys.itemsOf(id),
  ],
})

export const useCancelStockOpname = createMutationHook({
  mutationFn: (id: string) => StockOpnameService.cancel(id),
  successMessage: "Stok opname berhasil dibatalkan",
  errorMessage: "Gagal membatalkan stok opname",
  invalidates: (id) => [stockOpnameKeys.lists, stockOpnameKeys.detail(id)],
})

export const useDeleteStockOpname = createMutationHook({
  mutationFn: (id: string) => StockOpnameService.delete(id),
  successMessage: "Stok opname berhasil dihapus",
  errorMessage: "Gagal menghapus stok opname",
  invalidates: () => [stockOpnameKeys.lists],
})
