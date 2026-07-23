import { fetchBlobRaw } from "@/lib/api-client";
import type { RincianPendapatanParams } from "@/types/laporan/rincian-pendapatan";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const RincianPendapatanService = {
  exportRincianPendapatan: async (
    params: RincianPendapatanParams,
  ): Promise<Blob> => {
    const sp = new URLSearchParams();
    sp.set("jenis", params.jenis);
    sp.set("from", params.from);
    sp.set("to", params.to);
    params.item_ids?.forEach((id) => sp.append("item_ids[]", id));

    return fetchBlobRaw(
      `/reports/sales/income/export?${sp.toString()}`,
      XLSX_MIME,
    );
  },
};
