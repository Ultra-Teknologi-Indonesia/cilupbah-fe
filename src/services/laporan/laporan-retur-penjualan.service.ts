import { fetchBlobRaw } from "@/lib/api-client";
import type { SalesListParams } from "@/types/laporan/laporan-penjualan";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const LaporanReturPenjualanService = {
  exportSalesReturn: async (params: SalesListParams): Promise<Blob> => {
    const sp = new URLSearchParams();
    sp.set("from", params.from);
    sp.set("to", params.to);
    params.location_ids?.forEach((id) => sp.append("location_ids[]", id));

    return fetchBlobRaw(
      `/reports/sales/return/export?${sp.toString()}`,
      XLSX_MIME,
    );
  },
};
