"use client";

import { useQuery } from "@tanstack/react-query";

import { useAsyncExport } from "@/hooks/laporan/use-async-export";
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
  return useAsyncExport((params: SettlementParams) =>
    ReportService.settlementExportAsync(params),
  );
}
