"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { ReportService } from "@/services/laporan/report.service";
import type { SettlementParams } from "@/types/laporan/settlement";

const STALE = 30_000;

export function useLaporanSettlement(params: SettlementParams, enabled = true) {
  return useQuery({
    queryKey: ["laporan", "settlement", params],
    queryFn: () => ReportService.settlement(params),
    staleTime: STALE,
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useLaporanSettlementSummary(
  params: SettlementParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["laporan", "settlement", "summary", params],
    queryFn: () => ReportService.settlementSummary(params),
    staleTime: STALE,
    enabled,
    retry: false,
    placeholderData: (prev) => prev,
  });
}

export function useLaporanSettlementExport() {
  return useMutation({
    mutationFn: async (params: SettlementParams) => {
      const blob = await ReportService.settlementExport(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      const from = params.date_from ?? "semua";
      const to = params.date_to ?? stamp;
      a.download = `laporan-settlement-${from}-${to}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
