import { fetchClient } from "@/lib/api-client";
import type { OrderActivityResponse } from "@/types/pesanan/activity";

export const OrderActivityService = {
  list: (orderId: string, cursor?: string | null, perPage = 50) => {
    const sp = new URLSearchParams();
    if (cursor) sp.set("cursor", cursor);
    sp.set("per_page", String(perPage));
    const qs = sp.toString();
    return fetchClient<OrderActivityResponse>(
      `/sales/${orderId}/activities${qs ? `?${qs}` : ""}`,
    );
  },
};
