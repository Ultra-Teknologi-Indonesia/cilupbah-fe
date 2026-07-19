import { fetchBlobPost, fetchBlobRaw, fetchClient } from "@/lib/api-client";
import type {
  PicklistDetailPdfParams,
  PicklistExportParams,
  PicklistLookupItem,
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

  picklistDetailPdf: (params: PicklistDetailPdfParams): Promise<Blob> => {
    return fetchBlobPost(
      `/reports/wms/pick-list/pdf`,
      params,
      "application/pdf",
    );
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
