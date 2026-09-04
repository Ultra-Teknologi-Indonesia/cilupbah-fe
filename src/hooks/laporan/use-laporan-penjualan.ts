"use client";

import { useAsyncExport } from "@/hooks/laporan/use-async-export";
import { LaporanPenjualanService } from "@/services/laporan/laporan-penjualan.service";
import type { SalesListParams } from "@/types/laporan/laporan-penjualan";

export function useExportSalesList() {
  return useAsyncExport((params: SalesListParams) =>
    LaporanPenjualanService.exportSalesList(params),
  );
}
