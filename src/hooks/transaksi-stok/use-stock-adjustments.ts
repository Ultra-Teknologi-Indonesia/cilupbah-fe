"use client";
import { useMutation, useQuery } from "@tanstack/react-query";

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
import { STOCK_VIEW_KEYS } from "@/lib/stock-cache";

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
  invalidates: () => [stockAdjustmentKeys.lists, ...STOCK_VIEW_KEYS],
});

export const useUpdateStockAdjustment = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: StockAdjustmentFormData }) =>
    StockAdjustmentService.update(id, data),
  successMessage: "Koreksi stok berhasil diperbarui",
  errorMessage: "Gagal memperbarui koreksi stok",
  invalidates: ({ id }) => [
    stockAdjustmentKeys.lists,
    stockAdjustmentKeys.detail(id),
    [...stockAdjustmentKeys.detail(id), "items"],
    ...STOCK_VIEW_KEYS,
  ],
});

export const useDeleteStockAdjustment = createMutationHook({
  mutationFn: (id: string) => StockAdjustmentService.delete(id),
  successMessage: "Koreksi stok berhasil dihapus",
  errorMessage: "Gagal menghapus koreksi stok",
  invalidates: () => [stockAdjustmentKeys.lists, ...STOCK_VIEW_KEYS],
});

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useExportStockAdjustments() {
  return useMutation({
    mutationFn: async (params: StockAdjustmentListParams = {}) => {
      const blob = await StockAdjustmentService.exportXlsx(params);
      const filename = `koreksi-stok-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.xlsx`;
      downloadBlob(blob, filename);
      return filename;
    },
  });
}

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
  invalidates: () => [stockAdjustmentKeys.lists, ...STOCK_VIEW_KEYS],
});
