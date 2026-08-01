"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard/dashboard.service";
import type {
  DashboardSummaryParams,
  DashboardQueue,
  DashboardQueueParams,
} from "@/types/dashboard/dashboard";
import { freshOnViewOptions, liveQueryOptions } from "@/lib/query-config";

export function useDashboardSummary(params: DashboardSummaryParams = {}) {
  return useQuery({
    queryKey: ["dashboard", "summary", params],
    queryFn: () => DashboardService.summary(params),
    ...freshOnViewOptions,
  });
}

export function useDashboardQueue(
  queue: DashboardQueue,
  params: DashboardQueueParams = {},
) {
  return useQuery({
    queryKey: ["dashboard", "queue", queue, params],
    queryFn: () => DashboardService.queue(queue, params),
    ...liveQueryOptions,
  });
}
