"use client";

import { useAsyncExport } from "@/hooks/laporan/use-async-export";
import { RincianPendapatanService } from "@/services/laporan/rincian-pendapatan.service";
import type { RincianPendapatanParams } from "@/types/laporan/rincian-pendapatan";

export function useExportRincianPendapatan() {
  return useAsyncExport((params: RincianPendapatanParams) =>
    RincianPendapatanService.exportRincianPendapatan(params),
  );
}
