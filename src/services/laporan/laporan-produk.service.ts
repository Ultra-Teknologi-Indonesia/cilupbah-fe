import { fetchBlobRaw, fetchClient } from "@/lib/api-client";
import type { ApiPaginated } from "@/types/api.types";
import type { SalesProductParams, SkuOption } from "@/types/laporan/laporan-produk";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const LaporanProdukService = {
  exportSalesProduct: async (params: SalesProductParams): Promise<Blob> => {
    const sp = new URLSearchParams();
    sp.set("from", params.from);
    sp.set("to", params.to);
    params.location_ids?.forEach((id) => sp.append("location_ids[]", id));
    params.item_ids?.forEach((id) => sp.append("item_ids[]", id));

    return fetchBlobRaw(
      `/reports/sales/product/export?${sp.toString()}`,
      XLSX_MIME,
    );
  },

  searchSkuOptions: async (
    search: string,
    page: number,
    perPage = 20,
  ): Promise<ApiPaginated<SkuOption>> => {
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    sp.set("page", String(page));
    sp.set("per_page", String(perPage));

    return fetchClient<ApiPaginated<SkuOption>>(
      `/reports/sales/product/sku-options?${sp.toString()}`,
    );
  },
};
