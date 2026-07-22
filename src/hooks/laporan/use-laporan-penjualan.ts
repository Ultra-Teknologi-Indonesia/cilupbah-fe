"use client";

import { useMutation } from "@tanstack/react-query";

import { LaporanPenjualanService } from "@/services/laporan/laporan-penjualan.service";
import type { SalesListParams } from "@/types/laporan/laporan-penjualan";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useExportSalesList() {
  return useMutation({
    mutationFn: async (params: SalesListParams) => {
      const blob = await LaporanPenjualanService.exportSalesList(params);
      downloadBlob(blob, `daftar-penjualan-${params.from}-${params.to}.xlsx`);
    },
  });
}
