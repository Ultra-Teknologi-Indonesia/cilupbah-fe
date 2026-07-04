"use client";
import { useQuery } from "@tanstack/react-query";

import {
  StockAdjustmentService,
  type BulkDeleteResult,
} from "@/services/transaksi-stok/stock-adjustment.service";
import type {
  StockAdjustmentListParams,
  StockAdjustmentFormData,
} from "@/types/transaksi-stok/stock-adjustment";
import {
  createDetailHook,
  createListHook,
  createMutationHook,
  createResourceKeys,
} from "@/hooks/create-crud-hooks";

export const stockAdjustmentKeys = createResourceKeys("stock-adjustment");

export const useStockAdjustments = createListHook(
  stockAdjustmentKeys,
  (params: StockAdjustmentListParams = {}) =>
    StockAdjustmentService.list(params),
);

export const useStockAdjustmentDetail = createDetailHook(
  stockAdjustmentKeys,
  (id: string) => StockAdjustmentService.getById(id),
);

export const useStockAdjustmentItems = (
  id: string,
  params: StockAdjustmentListParams = {},
) => {
  return useQuery({
    queryKey: [...stockAdjustmentKeys.detail(id), "items", params],
    queryFn: () => StockAdjustmentService.getItems(id, params),
  });
};

export const useCreateStockAdjustment = createMutationHook({
  mutationFn: (data: StockAdjustmentFormData) =>
    StockAdjustmentService.create(data),
  successMessage: "Koreksi stok berhasil dibuat",
  errorMessage: "Gagal membuat koreksi stok",
  invalidates: () => [stockAdjustmentKeys.lists],
});

export const useDeleteStockAdjustment = createMutationHook({
  mutationFn: (id: string) => StockAdjustmentService.delete(id),
  successMessage: "Koreksi stok berhasil dihapus",
  errorMessage: "Gagal menghapus koreksi stok",
  invalidates: () => [stockAdjustmentKeys.lists],
});

export const useBulkDeleteStockAdjustment = createMutationHook<
  string[],
  BulkDeleteResult
>({
  mutationFn: (ids: string[]) => StockAdjustmentService.bulkDelete(ids),
  successMessage: (data) =>
    data.failed.length > 0
      ? `${data.deleted} dokumen dihapus, ${data.failed.length} gagal`
      : `${data.deleted} dokumen berhasil dihapus`,
  errorMessage: "Gagal menghapus koreksi stok",
  invalidates: () => [stockAdjustmentKeys.lists],
});
