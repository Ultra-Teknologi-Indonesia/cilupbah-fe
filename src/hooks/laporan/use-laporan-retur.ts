"use client";

import { useQuery } from "@tanstack/react-query";

import { useAsyncExport } from "@/hooks/laporan/use-async-export";
import { ReportService } from "@/services/laporan/report.service";
import type { LaporanReturParams } from "@/types/laporan/retur";

const STALE = 30_000;

export function useLaporanRetur(params: LaporanReturParams, enabled = true) {
  return useQuery({
    queryKey: ["laporan", "retur", params],
    queryFn: () => ReportService.retur(params),
    staleTime: STALE,
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useLaporanReturExport() {
  return useAsyncExport((params: LaporanReturParams) =>
    ReportService.returExportAsync(params),
  );
}
