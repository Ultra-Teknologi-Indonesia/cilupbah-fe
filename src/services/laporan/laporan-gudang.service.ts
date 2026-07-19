import { fetchBlobRaw } from "@/lib/api-client";
import type { TransferReportParams } from "@/types/laporan/laporan-gudang";

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
};
