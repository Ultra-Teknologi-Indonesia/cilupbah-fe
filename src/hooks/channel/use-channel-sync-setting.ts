"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ChannelService } from "@/services/channel/channel.service";
import { apiError } from "@/lib/toast";

export const CHANNEL_SYNC_SETTING_KEY = ["channel-sync-setting"] as const;

export function useChannelSyncSetting() {
  return useQuery({
    queryKey: CHANNEL_SYNC_SETTING_KEY,
    queryFn: ChannelService.getSyncSetting,
    staleTime: 60_000,
  });
}

export function useSetChannelSyncSetting() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => ChannelService.setSyncSetting(enabled),
    onSuccess: (enabled) => {
      qc.setQueryData(CHANNEL_SYNC_SETTING_KEY, enabled);
      toast.success(
        enabled
          ? "Sinkronisasi channel diaktifkan"
          : "Sinkronisasi channel dijeda",
      );
    },
    onError: (err) => apiError(err, "Gagal memperbarui sinkronisasi channel"),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: CHANNEL_SYNC_SETTING_KEY }),
  });
}
