"use client";

import { StockAdjustmentImportService } from "@/services/transaksi-stok/stock-adjustment-import.service";
import type { ImportConfirmPayload } from "@/types/transaksi-stok/stock-adjustment-import";
import { createMutationHook } from "@/hooks/create-crud-hooks";
import { stockAdjustmentKeys } from "@/hooks/transaksi-stok/use-stock-adjustments";
import { STOCK_VIEW_KEYS } from "@/lib/stock-cache";

export const usePreviewStockAdjustmentImport = createMutationHook({
  mutationFn: ({ file, locationId }: { file: File; locationId: string }) =>
    StockAdjustmentImportService.preview(file, locationId),

  errorMessage: "Gagal memproses file import",
  invalidates: () => [],
});

export const useConfirmStockAdjustmentImport = createMutationHook({
  mutationFn: (payload: ImportConfirmPayload) =>
    StockAdjustmentImportService.confirm(payload),
  successMessage: "Import penyesuaian stok berhasil diterapkan",
  errorMessage: "Gagal menerapkan import",
  invalidates: () => [stockAdjustmentKeys.lists, ...STOCK_VIEW_KEYS],
});
