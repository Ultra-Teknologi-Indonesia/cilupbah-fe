"use client"

import { StockAdjustmentService } from "@/services/transaksi-stok/stock-adjustment.service"
import type { StockAdjustmentListParams, StockAdjustmentFormData } from "@/types/transaksi-stok/stock-adjustment"
import {
  createDetailHook,
  createListHook,
  createMutationHook,
  createResourceKeys,
} from "@/hooks/create-crud-hooks"

export const stockAdjustmentKeys = createResourceKeys("stock-adjustment")

export const useStockAdjustments = createListHook(
  stockAdjustmentKeys,
  (params: StockAdjustmentListParams = {}) => StockAdjustmentService.list(params)
)

export const useStockAdjustmentDetail = createDetailHook(
  stockAdjustmentKeys,
  (id: string) => StockAdjustmentService.getById(id)
)

export const useCreateStockAdjustment = createMutationHook({
  mutationFn: (data: StockAdjustmentFormData) => StockAdjustmentService.create(data),
  successMessage: "Penyesuaian stok berhasil dibuat",
  errorMessage: "Gagal membuat penyesuaian stok",
  invalidates: () => [stockAdjustmentKeys.lists],
})

export const useApproveStockAdjustment = createMutationHook({
  mutationFn: ({ id, approvedBy }: { id: string; approvedBy: string }) =>
    StockAdjustmentService.approve(id, approvedBy),
  successMessage: "Penyesuaian stok berhasil disetujui",
  errorMessage: "Gagal menyetujui penyesuaian stok",
  invalidates: ({ id }) => [stockAdjustmentKeys.lists, stockAdjustmentKeys.detail(id)],
})

export const useCancelStockAdjustment = createMutationHook({
  mutationFn: (id: string) => StockAdjustmentService.cancel(id),
  successMessage: "Penyesuaian stok berhasil dibatalkan",
  errorMessage: "Gagal membatalkan penyesuaian stok",
  invalidates: (id) => [stockAdjustmentKeys.lists, stockAdjustmentKeys.detail(id)],
})

export const useDeleteStockAdjustment = createMutationHook({
  mutationFn: (id: string) => StockAdjustmentService.delete(id),
  successMessage: "Penyesuaian stok berhasil dihapus",
  errorMessage: "Gagal menghapus penyesuaian stok",
  invalidates: () => [stockAdjustmentKeys.lists],
})
