"use client";

import { useAsyncExport } from "@/hooks/laporan/use-async-export";
import { LaporanReturPenjualanService } from "@/services/laporan/laporan-retur-penjualan.service";
import type { SalesListParams } from "@/types/laporan/laporan-penjualan";

export function useExportSalesReturn() {
  return useAsyncExport((params: SalesListParams) =>
    LaporanReturPenjualanService.exportSalesReturn(params),
  );
}
