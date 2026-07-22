"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { LaporanGudangService } from "@/services/laporan/laporan-gudang.service";
import type {
  OrderPerformanceParams,
  PicklistDetailPdfParams,
  PicklistExportParams,
  PutawayListParams,
  PutawayPerformanceParams,
  ShipmentByCourierParams,
  ShipmentExportParams,
  TransferReportParams,
} from "@/types/laporan/laporan-gudang";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useExportTransferReport() {
  return useMutation({
    mutationFn: async (params: TransferReportParams) => {
      const blob = await LaporanGudangService.exportTransfer(params);
      downloadBlob(
        blob,
        `laporan-transfer-${params.jenis}-${params.from}-${params.to}.xlsx`,
      );
    },
  });
}

export function useExportPicklistReport() {
  return useMutation({
    mutationFn: async (params: PicklistExportParams) => {
      const blob = await LaporanGudangService.exportPicklist(params);
      downloadBlob(blob, `daftar-picklist-${params.from}-${params.to}.xlsx`);
    },
  });
}

export function useExportShipmentList() {
  return useMutation({
    mutationFn: async (params: ShipmentExportParams) => {
      const blob = await LaporanGudangService.exportShipmentList(params);
      downloadBlob(blob, `daftar-pengiriman-${params.from}-${params.to}.xlsx`);
    },
  });
}

export function useExportOrderPerformance() {
  return useMutation({
    mutationFn: async (params: OrderPerformanceParams) => {
      const blob = await LaporanGudangService.exportOrderPerformance(params);
      downloadBlob(
        blob,
        `laporan-performa-${params.jenis}-${params.mode}-${params.from}-${params.to}.xlsx`,
      );
    },
  });
}

export function useExportPutawayPerformance() {
  return useMutation({
    mutationFn: async (params: PutawayPerformanceParams) => {
      const blob = await LaporanGudangService.exportPutawayPerformance(params);
      downloadBlob(
        blob,
        `laporan-performa-penempatan-${params.mode}-${params.from}-${params.to}.xlsx`,
      );
    },
  });
}

export function useExportPutawayList() {
  return useMutation({
    mutationFn: async (params: PutawayListParams) => {
      const blob = await LaporanGudangService.exportPutawayList(params);
      downloadBlob(blob, `daftar-penempatan-barang-${params.date}.xlsx`);
    },
  });
}

export function useExportShipmentByCourier() {
  return useMutation({
    mutationFn: async (params: ShipmentByCourierParams) => {
      const blob = await LaporanGudangService.exportShipmentByCourier(params);
      downloadBlob(
        blob,
        `laporan-pengiriman-ekspedisi-${params.mode}-${params.from}-${params.to}.xlsx`,
      );
    },
  });
}

export function useExportPicklistDetail() {
  return useMutation({
    mutationFn: async (params: PicklistDetailPdfParams) => {
      const blob = await LaporanGudangService.exportPicklistDetail(params);
      downloadBlob(blob, `detail-picklist-${params.picklist_id.slice(0, 8)}.xlsx`);
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
