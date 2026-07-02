"use client"

import { StockRevaluationService } from "@/services/transaksi-stok/stock-revaluation.service"
import type { StockRevaluationListParams, StockRevaluationFormData } from "@/types/transaksi-stok/stock-revaluation"
import {
  createDetailHook,
  createListHook,
  createMutationHook,
  createResourceKeys,
} from "@/hooks/create-crud-hooks"

export const stockRevaluationKeys = createResourceKeys("stock-revaluation")

export const useStockRevaluations = createListHook(
  stockRevaluationKeys,
  (params: StockRevaluationListParams = {}) => StockRevaluationService.list(params)
)

export const useStockRevaluationDetail = createDetailHook(
  stockRevaluationKeys,
  (id: string) => StockRevaluationService.getById(id)
)

export const useCreateStockRevaluation = createMutationHook({
  mutationFn: (data: StockRevaluationFormData) => StockRevaluationService.create(data),
  successMessage: "Perubahan nilai stok berhasil dibuat",
  errorMessage: "Gagal membuat perubahan nilai stok",
  invalidates: () => [stockRevaluationKeys.lists],
})

export const useCancelStockRevaluation = createMutationHook({
  mutationFn: (id: string) => StockRevaluationService.cancel(id),
  successMessage: "Perubahan nilai stok berhasil dibatalkan",
  errorMessage: "Gagal membatalkan perubahan nilai stok",
  invalidates: (id) => [stockRevaluationKeys.lists, stockRevaluationKeys.detail(id)],
})
