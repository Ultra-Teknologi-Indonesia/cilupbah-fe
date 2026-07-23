"use client";

import { useMutation } from "@tanstack/react-query";

import { RincianPendapatanService } from "@/services/laporan/rincian-pendapatan.service";
import type { RincianPendapatanParams } from "@/types/laporan/rincian-pendapatan";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useExportRincianPendapatan() {
  return useMutation({
    mutationFn: async (params: RincianPendapatanParams) => {
      const blob =
        await RincianPendapatanService.exportRincianPendapatan(params);
      const suffix = params.jenis === "per_barang" ? "-barang" : "";
      downloadBlob(
        blob,
        `rincian-pendapatan${suffix}-${params.from}-${params.to}.xlsx`,
      );
    },
  });
}
