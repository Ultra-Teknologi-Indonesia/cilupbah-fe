"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { PurchaseOrderActivityService } from "@/services/transaksi-pembelian/purchase-order-activity.service";
import type { PurchaseOrderActivityResponse } from "@/types/transaksi-pembelian/activity";

const STALE = 15_000;

export const purchaseOrderActivityKeys = {
  all: ["transaksi-pembelian", "activities"] as const,
  detail: (poId: string) =>
    ["transaksi-pembelian", "activities", poId] as const,
};

export function usePurchaseOrderActivities(
  poId: string | undefined,
  enabled = true,
) {
  return useInfiniteQuery<PurchaseOrderActivityResponse>({
    queryKey: purchaseOrderActivityKeys.detail(poId ?? ""),
    enabled: enabled && Boolean(poId),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      PurchaseOrderActivityService.list(
        poId as string,
        pageParam as string | null,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_more ? lastPage.meta.next_cursor : null,
    staleTime: STALE,
  });
}
