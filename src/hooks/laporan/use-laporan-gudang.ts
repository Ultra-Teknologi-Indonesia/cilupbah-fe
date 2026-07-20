"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { LaporanGudangService } from "@/services/laporan/laporan-gudang.service";
import type {
  PicklistExportParams,
  ShipmentExportParams,
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

export function useExportShipmentList() {
  return useMutation({
    mutationFn: async (params: ShipmentExportParams) => {
      const blob = await LaporanGudangService.exportShipmentList(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daftar-pengiriman-${params.from}-${params.to}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useShipmentFilterOptions(enabled = true) {
  return useQuery({
    queryKey: ["laporan", "gudang", "shipment-options"],
    queryFn: () => LaporanGudangService.shipmentFilterOptions(),
    staleTime: 5 * 60_000,
    enabled,
  });
}

export function usePutawayNumbers(
  date: string,
  locationId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["laporan", "gudang", "putaway-numbers", date, locationId],
    queryFn: () => LaporanGudangService.searchPutawayNumbers(date, locationId),
    staleTime: 30_000,
    enabled: enabled && Boolean(date && locationId),
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
