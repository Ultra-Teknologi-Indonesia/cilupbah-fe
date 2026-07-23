import { fetchBlobRaw } from "@/lib/api-client";
import type { SalesListParams } from "@/types/laporan/laporan-penjualan";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const DaftarPelangganService = {
  exportCustomerList: async (
    params: Pick<SalesListParams, "from" | "to">,
  ): Promise<Blob> => {
    const sp = new URLSearchParams();
    sp.set("from", params.from);
    sp.set("to", params.to);

    return fetchBlobRaw(
      `/reports/sales/customer/export?${sp.toString()}`,
      XLSX_MIME,
    );
  },
};
