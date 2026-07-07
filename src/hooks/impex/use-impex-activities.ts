"use client";

import { useQuery } from "@tanstack/react-query";

import { ImpexActivityService } from "@/services/impex/impex-activity.service";
import type { ImpexActivityListParams, ImpexDirection } from "@/types/impex";

export const impexKeys = {
  all: ["impex"] as const,
  list: (direction: ImpexDirection, params: ImpexActivityListParams) =>
    [...impexKeys.all, "list", direction, params] as const,
  details: (direction: ImpexDirection, id: string) =>
    [...impexKeys.all, "details", direction, id] as const,
};

export function useImpexActivities(
  direction: ImpexDirection,
  params: ImpexActivityListParams = {},
) {
  return useQuery({
    queryKey: impexKeys.list(direction, params),
    queryFn: () => ImpexActivityService.list(direction, params),
    staleTime: 30 * 1000,
  });
}

export function useImpexActivityDetails(
  direction: ImpexDirection,
  activityId: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: impexKeys.details(direction, activityId),
    queryFn: () => ImpexActivityService.details(direction, activityId),
    enabled: enabled && !!activityId,
  });
}
