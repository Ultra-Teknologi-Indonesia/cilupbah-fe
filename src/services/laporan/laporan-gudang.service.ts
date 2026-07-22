import { fetchBlobPost, fetchBlobRaw, fetchClient } from "@/lib/api-client";
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

  putawayPerformancePdf: (
    params: PutawayPerformanceParams,
  ): Promise<Blob> => {
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
