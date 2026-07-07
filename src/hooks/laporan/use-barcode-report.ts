"use client";

import { useMutation } from "@tanstack/react-query";

import { ReportService } from "@/services/laporan/report.service";
import type { BarcodeReportParams } from "@/types/laporan/barcode";

export function useBarcodeReportPreview() {
  return useMutation({
    mutationFn: (params: BarcodeReportParams) =>
      ReportService.barcodePreview(params),
  });
}
