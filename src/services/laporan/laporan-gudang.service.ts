import { fetchBlobPost, fetchBlobRaw, fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  PicklistDetailPdfParams,
  PicklistExportParams,
  OrderPerformanceParams,
  PicklistLookupItem,
  PutawayListParams,
  PutawayPerformanceParams,
  ShipmentByCourierParams,
  ShipmentExportParams,
  ShipmentFilterOption,
  ShipmentFilterOptions,
  TransferReportParams,
} from "@/types/laporan/laporan-gudang";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const LaporanGudangService = {
  exportTransfer: async (params: TransferReportParams): Promise<Blob> => {
    const sp = new URLSearchParams();
    sp.set("jenis", params.jenis);
    sp.set("from", params.from);
    sp.set("to", params.to);
    params.item_ids?.forEach((id) => sp.append("item_ids[]", id));

    return fetchBlobRaw(
      `/reports/wms/transfer/export?${sp.toString()}`,
      XLSX_MIME,
    );
  },

  exportPicklist: async (params: PicklistExportParams): Promise<Blob> => {
    const sp = new URLSearchParams();
    sp.set("from", params.from);
    sp.set("to", params.to);

    return fetchBlobRaw(
      `/reports/wms/pick-list/export?${sp.toString()}`,
      XLSX_MIME,
    );
  },

  orderPerformancePdf: (params: OrderPerformanceParams): Promise<Blob> => {
    return fetchBlobPost(
      `/reports/wms/order-performance/pdf`,
      params,
      "application/pdf",
    );
  },

  exportOrderPerformance: async (
    params: OrderPerformanceParams,
  ): Promise<Blob> => {
    const sp = new URLSearchParams();
    sp.set("jenis", params.jenis);
    sp.set("mode", params.mode);
    sp.set("from", params.from);
    sp.set("to", params.to);
    params.location_ids?.forEach((id) => sp.append("location_ids[]", id));

    return fetchBlobRaw(
      `/reports/wms/order-performance/export?${sp.toString()}`,
      XLSX_MIME,
    );
  },

  exportPutawayPerformance: async (
    params: PutawayPerformanceParams,
  ): Promise<Blob> => {
    const sp = new URLSearchParams();
    sp.set("mode", params.mode);
    sp.set("from", params.from);
    sp.set("to", params.to);
    params.location_ids?.forEach((id) => sp.append("location_ids[]", id));

    return fetchBlobRaw(
      `/reports/wms/putaway-performance/export?${sp.toString()}`,
      XLSX_MIME,
    );
  },

  exportPutawayList: async (params: PutawayListParams): Promise<Blob> => {
    const sp = new URLSearchParams();
    sp.set("date", params.date);
    sp.set("location_id", params.location_id);
    params.putaway_ids?.forEach((id) => sp.append("putaway_ids[]", id));

    return fetchBlobRaw(
      `/reports/wms/putaway-list/export?${sp.toString()}`,
      XLSX_MIME,
    );
  },

  exportShipmentByCourier: async (
    params: ShipmentByCourierParams,
  ): Promise<Blob> => {
    const sp = new URLSearchParams();
    sp.set("mode", params.mode);
    sp.set("from", params.from);
    sp.set("to", params.to);
    params.location_ids?.forEach((id) => sp.append("location_ids[]", id));

    return fetchBlobRaw(
      `/reports/wms/shipment-by-courier/export?${sp.toString()}`,
      XLSX_MIME,
    );
  },

  exportPicklistDetail: (params: PicklistDetailPdfParams): Promise<Blob> => {
    return fetchBlobPost(`/reports/wms/pick-list/xlsx`, params, XLSX_MIME);
  },

  // ---- Varian ASINKRON (antrean) untuk laporan berbasis memori ----
  // Memicu job, mengembalikan export_id untuk di-polling (lihat useAsyncExport).
  exportTransferAsync: async (
    params: TransferReportParams,
  ): Promise<string> => {
    const sp = new URLSearchParams();
    sp.set("jenis", params.jenis);
    sp.set("from", params.from);
    sp.set("to", params.to);
    params.item_ids?.forEach((id) => sp.append("item_ids[]", id));
    const res = await fetchClient<ApiResponse<{ export_id: string }>>(
      `/reports/wms/transfer/export/async?${sp.toString()}`,
    );
    return res.data.export_id;
  },

  exportOrderPerformanceAsync: async (
    params: OrderPerformanceParams,
  ): Promise<string> => {
    const sp = new URLSearchParams();
    sp.set("jenis", params.jenis);
    sp.set("mode", params.mode);
    sp.set("from", params.from);
    sp.set("to", params.to);
    params.location_ids?.forEach((id) => sp.append("location_ids[]", id));
    const res = await fetchClient<ApiResponse<{ export_id: string }>>(
      `/reports/wms/order-performance/export/async?${sp.toString()}`,
    );
    return res.data.export_id;
  },

  exportPutawayPerformanceAsync: async (
    params: PutawayPerformanceParams,
  ): Promise<string> => {
    const sp = new URLSearchParams();
    sp.set("mode", params.mode);
    sp.set("from", params.from);
    sp.set("to", params.to);
    params.location_ids?.forEach((id) => sp.append("location_ids[]", id));
    const res = await fetchClient<ApiResponse<{ export_id: string }>>(
      `/reports/wms/putaway-performance/export/async?${sp.toString()}`,
    );
    return res.data.export_id;
  },

  exportPutawayListAsync: async (
    params: PutawayListParams,
  ): Promise<string> => {
    const sp = new URLSearchParams();
    sp.set("date", params.date);
    sp.set("location_id", params.location_id);
    params.putaway_ids?.forEach((id) => sp.append("putaway_ids[]", id));
    const res = await fetchClient<ApiResponse<{ export_id: string }>>(
      `/reports/wms/putaway-list/export/async?${sp.toString()}`,
    );
    return res.data.export_id;
  },

  exportShipmentByCourierAsync: async (
    params: ShipmentByCourierParams,
  ): Promise<string> => {
    const sp = new URLSearchParams();
    sp.set("mode", params.mode);
    sp.set("from", params.from);
    sp.set("to", params.to);
    params.location_ids?.forEach((id) => sp.append("location_ids[]", id));
    const res = await fetchClient<ApiResponse<{ export_id: string }>>(
      `/reports/wms/shipment-by-courier/export/async?${sp.toString()}`,
    );
    return res.data.export_id;
  },

  exportPicklistDetailAsync: async (
    params: PicklistDetailPdfParams,
  ): Promise<string> => {
    const res = await fetchClient<ApiResponse<{ export_id: string }>>(
      `/reports/wms/pick-list/xlsx/async`,
      { method: "POST", data: params },
    );
    return res.data.export_id;
  },

  putawayListPdf: (params: PutawayListParams): Promise<Blob> => {
    return fetchBlobPost(
      `/reports/wms/putaway-list/pdf`,
      params,
      "application/pdf",
    );
  },

  searchPutawayNumbers: async (
    date: string,
    locationId: string,
  ): Promise<ShipmentFilterOption[]> => {
    const sp = new URLSearchParams({ date, location_id: locationId });

    const res = await fetchClient<{ data: ShipmentFilterOption[] }>(
      `/reports/wms/putaway-list/lookup?${sp.toString()}`,
    );
    return res.data ?? [];
  },

  shipmentByCourierPdf: (params: ShipmentByCourierParams): Promise<Blob> => {
    return fetchBlobPost(
      `/reports/wms/shipment-by-courier/pdf`,
      params,
      "application/pdf",
    );
  },

  putawayPerformancePdf: (params: PutawayPerformanceParams): Promise<Blob> => {
    return fetchBlobPost(
      `/reports/wms/putaway-performance/pdf`,
      params,
      "application/pdf",
    );
  },

  picklistDetailPdf: (params: PicklistDetailPdfParams): Promise<Blob> => {
    return fetchBlobPost(
      `/reports/wms/pick-list/pdf`,
      params,
      "application/pdf",
    );
  },

  exportShipmentList: async (params: ShipmentExportParams): Promise<Blob> => {
    const sp = new URLSearchParams();
    sp.set("from", params.from);
    sp.set("to", params.to);
    if (params.status_mp) sp.set("status_mp", params.status_mp);
    params.courier_ids?.forEach((id) => sp.append("courier_ids[]", id));

    return fetchBlobRaw(
      `/reports/wms/shipment/export?${sp.toString()}`,
      XLSX_MIME,
    );
  },

  shipmentFilterOptions: async (): Promise<ShipmentFilterOptions> => {
    const res = await fetchClient<{ data: ShipmentFilterOptions }>(
      `/reports/wms/shipment/options`,
    );
    return res.data ?? { couriers: [], statuses: [] };
  },

  searchPicklists: async (search: string): Promise<PicklistLookupItem[]> => {
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);

    const res = await fetchClient<{ data: PicklistLookupItem[] }>(
      `/reports/wms/pick-list/lookup?${sp.toString()}`,
    );
    return res.data ?? [];
  },
};
