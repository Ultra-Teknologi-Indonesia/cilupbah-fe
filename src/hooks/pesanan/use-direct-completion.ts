"use client";

import { useQuery } from "@tanstack/react-query";
import { DirectCompletionService } from "@/services/pesanan/direct-completion.service";
import { ProductPickerService } from "@/services/laporan/product-picker.service";
import type {
  BuyerConfirmationOutcome,
  DirectCompletionAllocation,
} from "@/types/pesanan/direct-completion";
import { createMutationHook } from "@/hooks/create-crud-hooks";
import { orderKeys } from "./use-orders";

export const buyerConfirmationKeys = {
  all: ["buyer-confirmations"] as const,
  list: (state: string) => ["buyer-confirmations", state] as const,
  forOrder: (orderId: string) =>
    ["buyer-confirmations", "order", orderId] as const,
};

const invalidatesAfterCompletion = () => [
  orderKeys.lists,
  orderKeys.counts,
  orderKeys.details,
  buyerConfirmationKeys.all,
];

export function useDirectCompletionPreview(
  orderIds: string[],
  enabled: boolean,
) {
  const key = [...orderIds].sort().join(",");

  return useQuery({
    queryKey: ["direct-completion-preview", key],
    queryFn: () => DirectCompletionService.preview(orderIds),
    enabled: enabled && orderIds.length > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
}

export const useCompleteOrdersDirectly = createMutationHook({
  mutationFn: (data: {
    orderIds: string[];
    allocations: DirectCompletionAllocation[];
  }) => DirectCompletionService.complete(data.orderIds, data.allocations),
  successMessage: (res) => {
    const completed = res.data?.completed_count ?? 0;
    const blocked = res.data?.blocked.length ?? 0;
    const raised = res.data?.raised_confirmations ?? 0;

    const parts = [`${completed} pesanan selesai`];
    if (blocked > 0) parts.push(`${blocked} tertahan`);
    if (raised > 0) parts.push(`${raised} menunggu konfirmasi pembeli`);

    return parts.join(" · ");
  },
  errorMessage: "Gagal menyelesaikan pesanan",
  invalidates: invalidatesAfterCompletion,
});

export function useBuyerConfirmations(
  state: "awaiting" | "waiting-stock",
  opts?: { enabled?: boolean; page?: number; perPage?: number },
) {
  return useQuery({
    queryKey: [...buyerConfirmationKeys.list(state), opts?.page ?? 1],
    queryFn: () =>
      DirectCompletionService.listConfirmations({
        state,
        page: opts?.page,
        per_page: opts?.perPage,
      }),
    enabled: opts?.enabled ?? true,
    staleTime: 30 * 1000,
  });
}

export function useOrderBuyerConfirmations(
  orderId: string | null | undefined,
  opts?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: buyerConfirmationKeys.forOrder(orderId ?? ""),
    queryFn: () =>
      DirectCompletionService.confirmationsForOrder(orderId as string),
    enabled: Boolean(orderId) && (opts?.enabled ?? true),
    staleTime: 30 * 1000,
  });
}

export function useReplacementSkuSearch(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ["replacement-sku", query],
    queryFn: async () => {
      const options = await ProductPickerService.searchVariants(query);
      return options.map((option) => ({
        ...option,
        value: option.badgeLabel ?? option.value,
      }));
    },
    enabled,
    staleTime: 30 * 1000,
  });
}

export const useDecideBuyerConfirmation = createMutationHook({
  mutationFn: (data: {
    confirmationId: string;
    outcome: BuyerConfirmationOutcome;
    replacementSku?: string;
    note?: string;
  }) =>
    DirectCompletionService.decide(data.confirmationId, {
      outcome: data.outcome,
      replacement_sku: data.replacementSku,
      note: data.note,
    }),
  successMessage: "Keputusan pembeli tersimpan",
  errorMessage: "Gagal menyimpan keputusan pembeli",
  invalidates: invalidatesAfterCompletion,
});
