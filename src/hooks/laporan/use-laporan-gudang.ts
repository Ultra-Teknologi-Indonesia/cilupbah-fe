"use client";

import { useMutation } from "@tanstack/react-query";

import { LaporanGudangService } from "@/services/laporan/laporan-gudang.service";
import type { TransferReportParams } from "@/types/laporan/laporan-gudang";

export function useExportTransferReport() {
  return useMutation({
    mutationFn: async (params: TransferReportParams) => {
      const blob = await LaporanGudangService.exportTransfer(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-transfer-${params.jenis}-${params.from}-${params.to}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
