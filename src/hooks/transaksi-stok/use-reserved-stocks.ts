"use client"

import { ReservedStockService } from "@/services/transaksi-stok/reserved-stock.service"
import type { ReservedStockListParams, ReservedStockFormData } from "@/types/transaksi-stok/reserved-stock"
import {
  createDetailHook,
  createListHook,
  createMutationHook,
  createResourceKeys,
} from "@/hooks/create-crud-hooks"

export const reservedStockKeys = createResourceKeys("reserved-stock")

export const useReservedStocks = createListHook(
  reservedStockKeys,
  (params: ReservedStockListParams = {}) => ReservedStockService.list(params)
)

export const useReservedStockDetail = createDetailHook(
  reservedStockKeys,
  (id: string) => ReservedStockService.getById(id)
)

export const useCreateReservedStock = createMutationHook({
  mutationFn: (data: ReservedStockFormData) => ReservedStockService.create(data),
  successMessage: "Stok cadangan berhasil dibuat",
  errorMessage: "Gagal membuat stok cadangan",
  invalidates: () => [reservedStockKeys.lists],
})

export const useCancelReservedStock = createMutationHook({
  mutationFn: (id: string) => ReservedStockService.cancel(id),
  successMessage: "Stok cadangan berhasil dibatalkan",
  errorMessage: "Gagal membatalkan stok cadangan",
  invalidates: (id) => [reservedStockKeys.lists, reservedStockKeys.detail(id)],
})
