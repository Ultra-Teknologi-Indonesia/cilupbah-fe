"use client"

import { useQuery } from "@tanstack/react-query"

import { ReportService } from "@/services/laporan/report.service"
import type { HppReportParams } from "@/types/laporan/hpp"

const STALE = 60_000

export const reportKeys = {
  all: ["laporan"] as const,
  hpp: (params: HppReportParams) => [...reportKeys.all, "hpp", params] as const,
}

export function useHppReport(params: HppReportParams, enabled = true) {
  return useQuery({
    queryKey: reportKeys.hpp(params),
    queryFn: () => ReportService.hpp(params),
    staleTime: STALE,
    enabled: enabled && Boolean(params.date_from && params.date_to),
  })
}
