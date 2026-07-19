import { fetchClient } from "@/lib/api-client";
import type { PurchaseOrderActivityResponse } from "@/types/transaksi-pembelian/activity";

export const PurchaseOrderActivityService = {
  list: (poId: string, cursor?: string | null, perPage = 50) => {
    const sp = new URLSearchParams();
    if (cursor) sp.set("cursor", cursor);
    sp.set("per_page", String(perPage));
    const qs = sp.toString();
    return fetchClient<PurchaseOrderActivityResponse>(
      `/purchase/orders/${poId}/activities${qs ? `?${qs}` : ""}`,
    );
  },
};
