"use client";

import { useMutation } from "@tanstack/react-query";

import { ReportService } from "@/services/laporan/report.service";
import type { PenyesuaianStokPdfParams } from "@/types/laporan/penyesuaian-stok";

export function usePenyesuaianStokPdf() {
  return useMutation({
    mutationFn: (params: PenyesuaianStokPdfParams) =>
      ReportService.penyesuaianStokPdf(params),
  });
}
