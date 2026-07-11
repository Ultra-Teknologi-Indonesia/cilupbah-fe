"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { NegativeStockService } from "@/services/laporan/negative-stock.service";
import type { NegativeStockParams } from "@/types/laporan/negative-stock";

const STALE = 30_000;

export function useNegativeStock(params: NegativeStockParams, enabled = true) {
  return useQuery({
    queryKey: ["laporan", "stok-minus", params],
    queryFn: () => NegativeStockService.list(params),
    staleTime: STALE,
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useNegativeStockExport() {
  return useMutation({
    mutationFn: async (params: NegativeStockParams) => {
      const blob = await NegativeStockService.export(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      const from = params.from ?? "semua";
      const to = params.to ?? stamp;
      a.download = `riwayat-stok-minus-${from}-${to}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
