"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

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
  return useMutation({
    mutationFn: async (params: LaporanReturParams) => {
      const blob = await ReportService.returExport(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      const from = params.date_from ?? "semua";
      const to = params.date_to ?? stamp;
      a.download = `laporan-retur-${from}-${to}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
