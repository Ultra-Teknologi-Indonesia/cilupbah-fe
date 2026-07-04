import { fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { Order } from "@/types/pesanan/order";
import type { ManualOrderPayload } from "@/types/pesanan/manual-order";

export const ManualOrderService = {
  create: async (payload: ManualOrderPayload) => {
    const res = await fetchClient<ApiResponse<Order>>("/sales/manual", {
      method: "POST",
      data: payload,
    });
    return res.data;
  },
};
