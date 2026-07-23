"use client";

import { useMutation } from "@tanstack/react-query";

import { LaporanReturPenjualanService } from "@/services/laporan/laporan-retur-penjualan.service";
import type { SalesListParams } from "@/types/laporan/laporan-penjualan";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useExportSalesReturn() {
  return useMutation({
    mutationFn: async (params: SalesListParams) => {
      const blob = await LaporanReturPenjualanService.exportSalesReturn(params);
      downloadBlob(
        blob,
        `daftar-retur-penjualan-${params.from}-${params.to}.xlsx`,
      );
    },
  });
}
