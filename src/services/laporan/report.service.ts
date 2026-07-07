import { fetchBlobPost, fetchBlobRaw, fetchClient } from "@/lib/api-client";
import type { ApiPaginated, ApiResponse } from "@/types/api.types";
import type { BarcodeReportParams } from "@/types/laporan/barcode";
import type { HppReportParams, HppReportPayload } from "@/types/laporan/hpp";
import type { PenyesuaianStokPdfParams } from "@/types/laporan/penyesuaian-stok";
import type {
  LaporanReturParams,
  LaporanReturRow,
} from "@/types/laporan/retur";

function buildReturQuery(params: LaporanReturParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (params.date_from) sp.set("date_from", params.date_from);
  if (params.date_to) sp.set("date_to", params.date_to);
  if (params.location_id) sp.set("location_id", params.location_id);
  if (params.channel_shop_id) sp.set("channel_shop_id", params.channel_shop_id);
  if (params.status) sp.set("status", params.status);
  if (params.source) sp.set("source", params.source);
  if (params.page) sp.set("page", String(params.page));
  if (params.per_page) sp.set("limit", String(params.per_page));
  return sp;
}

export const ReportService = {
  hpp: (params: HppReportParams) => {
    const sp = new URLSearchParams();
    sp.set("date_from", params.date_from);
    sp.set("date_to", params.date_to);
    if (params.location_id) sp.set("location_id", params.location_id);

    return fetchClient<ApiResponse<HppReportPayload>>(
      `/reports/hpp?${sp.toString()}`,
    );
  },

  retur: async (params: LaporanReturParams = {}) => {
    const sp = buildReturQuery(params);
    const res = await fetchClient<ApiPaginated<LaporanReturRow>>(
      `/sales/returns/report?${sp.toString()}`,
    );
    return { items: res.data ?? [], meta: res.meta };
  },

  returExport: async (params: LaporanReturParams = {}): Promise<Blob> => {
    const sp = buildReturQuery(params);
    return fetchBlobRaw(
      `/sales/returns/report/export?${sp.toString()}`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  },

  barcodePdf: (params: BarcodeReportParams): Promise<Blob> => {
    return fetchBlobPost(`/reports/barcode/pdf`, params, "application/pdf");
  },

  penyesuaianStokPdf: (params: PenyesuaianStokPdfParams): Promise<Blob> => {
    return fetchBlobPost(
      `/reports/penyesuaian-stok/pdf`,
      params,
      "application/pdf",
    );
  },
};
