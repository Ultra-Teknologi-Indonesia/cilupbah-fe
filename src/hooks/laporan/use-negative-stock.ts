"use client";

import { useQuery } from "@tanstack/react-query";

import { useAsyncExport } from "@/hooks/laporan/use-async-export";
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
  return useAsyncExport((params: NegativeStockParams) =>
    NegativeStockService.exportAsync(params),
  );
}
