import { fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  AcceptReplenishmentPayload,
  StockReplenishment,
  StockReplenishmentListParams,
} from "@/types/gudang/stock-replenishment";

interface ListResponse {
  items: StockReplenishment[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const StockReplenishmentService = {
  list: async (params: StockReplenishmentListParams = {}) => {
    const res = await fetchClient<ApiResponse<ListResponse>>(
      "/inventory/stock-replenishment",
      {
        method: "GET",
        params: params as Record<string, string | number | undefined>,
      },
    );
    return res.data;
  },

  detail: async (id: string) => {
    const res = await fetchClient<ApiResponse<StockReplenishment>>(
      `/inventory/stock-replenishment/${id}`,
      { method: "GET" },
    );
    return res.data;
  },

  pendingCount: async () => {
    const res = await fetchClient<ApiResponse<{ count: number }>>(
      "/inventory/stock-replenishment/pending-count",
      { method: "GET" },
    );
    return res.data.count;
  },

  accept: async (id: string, payload: AcceptReplenishmentPayload) => {
    const res = await fetchClient<ApiResponse<StockReplenishment>>(
      `/inventory/stock-replenishment/${id}/accept`,
      { method: "POST", data: payload },
    );
    return res.data;
  },

  reject: async (id: string, reason?: string) => {
    const res = await fetchClient<ApiResponse<StockReplenishment>>(
      `/inventory/stock-replenishment/${id}/reject`,
      { method: "POST", data: { reason } },
    );
    return res.data;
  },
};
