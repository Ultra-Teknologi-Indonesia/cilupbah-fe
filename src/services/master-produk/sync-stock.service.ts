import { fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";

export type SyncStockMode = "single" | "bulk" | "all";

export interface SyncStockFilters {
  channel_shop_id?: string | null;
  search?: string;
  status?: string;
  category_id?: string;
}

export interface SyncStockPayload {
  mode: SyncStockMode;

  productIds?: string[];
  channelShopId?: string | null;
  filters?: SyncStockFilters;
}

export interface SyncStockResult {
  queued?: number;
}

export const SyncStockService = {
  syncStock: async (
    payload: SyncStockPayload,
  ): Promise<ApiResponse<SyncStockResult>> => {
    const body: Record<string, unknown> = {
      mode: payload.mode,
      product_ids: payload.productIds ?? [],
    };
    if (payload.channelShopId !== undefined) {
      body.channel_shop_id = payload.channelShopId;
    }
    if (payload.filters) {
      body.filters = payload.filters;
    }

    return fetchClient<ApiResponse<SyncStockResult>>("/products/sync-stock", {
      method: "POST",
      data: body,
    });
  },
};
