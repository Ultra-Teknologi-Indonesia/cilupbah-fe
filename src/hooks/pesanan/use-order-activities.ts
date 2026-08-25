"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { subscribeToOrderActivityChanged } from "@/lib/pesanan/order-activity-event";
import { subscribeToShippingLabelPrinted } from "@/lib/pesanan/shipping-label-audit-event";
import { OrderActivityService } from "@/services/pesanan/order-activity.service";
import type { OrderActivityResponse } from "@/types/pesanan/activity";

export const orderActivityKeys = {
  all: ["pesanan", "activities"] as const,
  detail: (orderId: string) => ["pesanan", "activities", orderId] as const,
};

export function useOrderActivities(
  orderId: string | undefined,
  enabled = true,
) {
  const query = useInfiniteQuery<OrderActivityResponse>({
    queryKey: orderActivityKeys.detail(orderId ?? ""),
    enabled: enabled && Boolean(orderId),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      OrderActivityService.list(orderId as string, pageParam as string | null),
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_more ? lastPage.meta.next_cursor : null,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const { refetch } = query;

  React.useEffect(() => {
    if (!enabled || !orderId) return;

    return subscribeToShippingLabelPrinted((event) => {
      if (event.orderIds.includes(orderId)) {
        void refetch();
      }
    });
  }, [enabled, orderId, refetch]);

  React.useEffect(() => {
    if (!enabled || !orderId) return;

    return subscribeToOrderActivityChanged((event) => {
      if (event.orderIds.includes(orderId)) {
        void refetch();
      }
    });
  }, [enabled, orderId, refetch]);

  return query;
}
