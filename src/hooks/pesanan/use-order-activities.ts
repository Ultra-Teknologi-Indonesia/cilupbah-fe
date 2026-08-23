"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { OrderActivityService } from "@/services/pesanan/order-activity.service";
import type { OrderActivityResponse } from "@/types/pesanan/activity";

const STALE = 15_000;

export const orderActivityKeys = {
  all: ["pesanan", "activities"] as const,
  detail: (orderId: string) => ["pesanan", "activities", orderId] as const,
};

export function useOrderActivities(
  orderId: string | undefined,
  enabled = true,
) {
  return useInfiniteQuery<OrderActivityResponse>({
    queryKey: orderActivityKeys.detail(orderId ?? ""),
    enabled: enabled && Boolean(orderId),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      OrderActivityService.list(orderId as string, pageParam as string | null),
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_more ? lastPage.meta.next_cursor : null,
    staleTime: STALE,
  });
}
