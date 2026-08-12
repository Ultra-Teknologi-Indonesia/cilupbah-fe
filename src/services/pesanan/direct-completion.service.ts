import { fetchClient } from "@/lib/api-client";
import type { ApiPaginated, ApiResponse } from "@/types/api.types";
import type {
  BuyerConfirmation,
  BuyerConfirmationOutcome,
  DirectCompletionAllocation,
  DirectCompletionPreview,
  DirectCompletionResult,
} from "@/types/pesanan/direct-completion";

export const DirectCompletionService = {
  preview: (orderIds: string[]) => {
    return fetchClient<ApiResponse<DirectCompletionPreview>>(
      "/sales/orders/direct-completion/preview",
      { method: "POST", data: { order_ids: orderIds } },
    );
  },

  complete: (orderIds: string[], allocations: DirectCompletionAllocation[]) => {
    return fetchClient<ApiResponse<DirectCompletionResult>>(
      "/sales/orders/direct-completion",
      { method: "POST", data: { order_ids: orderIds, allocations } },
    );
  },

  listConfirmations: (params: {
    state: "awaiting" | "waiting-stock";
    page?: number;
    per_page?: number;
  }) => {
    const sp = new URLSearchParams();
    sp.set("state", params.state);
    if (params.page) sp.set("page", String(params.page));
    if (params.per_page) sp.set("per_page", String(params.per_page));

    return fetchClient<ApiPaginated<BuyerConfirmation>>(
      `/sales/buyer-confirmations?${sp}`,
    );
  },

  confirmationsForOrder: (orderId: string) => {
    return fetchClient<ApiResponse<BuyerConfirmation[]>>(
      `/sales/orders/${orderId}/buyer-confirmations`,
    );
  },

  decide: (
    confirmationId: string,
    payload: {
      outcome: BuyerConfirmationOutcome;
      replacement_sku?: string;
      note?: string;
    },
  ) => {
    return fetchClient<ApiResponse<BuyerConfirmation>>(
      `/sales/buyer-confirmations/${confirmationId}/decide`,
      { method: "POST", data: payload },
    );
  },
};
