"use client"

import { useQuery } from "@tanstack/react-query"

import { ChannelService } from "@/services/channel/channel.service"

export const CHANNEL_STORES_KEY = ["channel", "stores"] as const

export function useConnectedStores() {
  return useQuery({
    queryKey: CHANNEL_STORES_KEY,
    queryFn: ChannelService.listStores,
    staleTime: 30 * 1000,
  })
}
