"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { LaporanGudangService } from "@/services/laporan/laporan-gudang.service";
import type {
  PicklistExportParams,
  TransferReportParams,
} from "@/types/laporan/laporan-gudang";

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

export function useExportPicklistReport() {
  return useMutation({
    mutationFn: async (params: PicklistExportParams) => {
      const blob = await LaporanGudangService.exportPicklist(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daftar-picklist-${params.from}-${params.to}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function usePicklistSearch(search: string, enabled = true) {
  return useQuery({
    queryKey: ["laporan", "gudang", "picklist-lookup", search],
    queryFn: () => LaporanGudangService.searchPicklists(search),
    staleTime: 30_000,
    enabled,
  });
}
