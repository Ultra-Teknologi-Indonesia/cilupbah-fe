"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ChannelService } from "@/services/channel/channel.service";

export const CHANNEL_STORES_KEY = ["channel", "stores"] as const;

export function useConnectedStores() {
  return useQuery({
    queryKey: CHANNEL_STORES_KEY,
    queryFn: ChannelService.listStores,
    staleTime: 30 * 1000,
  });
}

export function useFetchConnectedStores() {
  const qc = useQueryClient();
  return useCallback(
    () =>
      qc.fetchQuery({
        queryKey: CHANNEL_STORES_KEY,
        queryFn: ChannelService.listStores,
        staleTime: 30 * 1000,
      }),
    [qc],
  );
}
