import { keepPreviousData } from "@tanstack/react-query";

export const STALE_STATIC = 5 * 60_000;
export const STALE_DEFAULT = 30_000;
export const STALE_LIVE = 0;

export const REFETCH_LIVE = 20_000;

export const freshOnViewOptions = {
  staleTime: STALE_LIVE,
  refetchOnMount: "always",
  refetchOnWindowFocus: true,
  placeholderData: keepPreviousData,
} as const;

export const liveQueryOptions = {
  ...freshOnViewOptions,
  refetchInterval: REFETCH_LIVE,
  refetchIntervalInBackground: false,
} as const;
