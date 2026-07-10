"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard/dashboard.service";
import type {
  DashboardSummaryParams,
  DashboardQueue,
  DashboardQueueParams,
} from "@/types/dashboard/dashboard";

const STALE = 60 * 1000;

export function useDashboardSummary(params: DashboardSummaryParams = {}) {
  return useQuery({
    queryKey: ["dashboard", "summary", params],
    queryFn: () => DashboardService.summary(params),
    placeholderData: keepPreviousData,
    staleTime: STALE,
  });
}

export function useDashboardQueue(
  queue: DashboardQueue,
  params: DashboardQueueParams = {},
) {
  return useQuery({
    queryKey: ["dashboard", "queue", queue, params],
    queryFn: () => DashboardService.queue(queue, params),
    placeholderData: keepPreviousData,
    staleTime: STALE,
  });
}
