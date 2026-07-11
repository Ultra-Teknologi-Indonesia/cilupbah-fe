import { fetchBlobRaw, fetchClient } from "@/lib/api-client";
import type { ApiPaginated } from "@/types/api.types";
import type {
  NegativeStockParams,
  NegativeStockRow,
} from "@/types/laporan/negative-stock";

function buildQuery(params: NegativeStockParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  if (params.location_id) sp.set("location_id", params.location_id);
  if (params.search) sp.set("search", params.search);
  if (params.still_negative) sp.set("still_negative", "1");
  if (params.page) sp.set("page", String(params.page));
  if (params.per_page) sp.set("per_page", String(params.per_page));
  return sp;
}

export const NegativeStockService = {
  list: async (params: NegativeStockParams = {}) => {
    const sp = buildQuery(params);
    const res = await fetchClient<ApiPaginated<NegativeStockRow>>(
      `/reports/negative-stock?${sp.toString()}`,
    );
    return { items: res.data ?? [], meta: res.meta };
  },

  export: async (params: NegativeStockParams = {}): Promise<Blob> => {
    const sp = buildQuery(params);
    return fetchBlobRaw(
      `/reports/negative-stock/export?${sp.toString()}`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  },
};
