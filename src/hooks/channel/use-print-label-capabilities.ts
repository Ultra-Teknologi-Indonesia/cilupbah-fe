"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ChannelService } from "@/services/channel/channel.service";
import type { PrintLabelCapabilities } from "@/types/channel";

export const PRINT_LABEL_CAPABILITIES_KEY = (source: string) =>
  ["channel", "print-label-capabilities", source.toLowerCase()] as const;

export function usePrintLabelCapabilities(source: string | null | undefined) {
  const s = (source ?? "").toLowerCase();
  return useQuery({
    queryKey: PRINT_LABEL_CAPABILITIES_KEY(s),
    queryFn: () => ChannelService.getPrintLabelCapabilities(s),
    enabled: !!s,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFetchPrintLabelCapabilities() {
  const qc = useQueryClient();
  return (source: string): Promise<PrintLabelCapabilities> => {
    const s = source.toLowerCase();
    return qc.fetchQuery({
      queryKey: PRINT_LABEL_CAPABILITIES_KEY(s),
      queryFn: () => ChannelService.getPrintLabelCapabilities(s),
      staleTime: 5 * 60 * 1000,
    });
  };
}
