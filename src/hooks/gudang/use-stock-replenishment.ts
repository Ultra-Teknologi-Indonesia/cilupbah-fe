"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { StockReplenishmentService } from "@/services/gudang/stock-replenishment.service";
import type {
  AcceptReplenishmentPayload,
  StockReplenishmentListParams,
} from "@/types/gudang/stock-replenishment";

const KEYS = {
  all: ["stock-replenishment"] as const,
  list: (params: StockReplenishmentListParams) =>
    [...KEYS.all, "list", params] as const,
  pendingCount: () => [...KEYS.all, "pending-count"] as const,
};

export function useStockReplenishments(params: StockReplenishmentListParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => StockReplenishmentService.list(params),
  });
}

export function usePendingReplenishmentCount() {
  return useQuery({
    queryKey: KEYS.pendingCount(),
    queryFn: () => StockReplenishmentService.pendingCount(),
    refetchInterval: 60_000,
  });
}

export function useAcceptReplenishment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AcceptReplenishmentPayload;
    }) => StockReplenishmentService.accept(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Permintaan pengisian stok disetujui");
    },
    onError: (err) => {
      const msg =
        (err as { message?: string })?.message ??
        "Gagal menyetujui permintaan.";
      toast.error(msg);
    },
  });
}

export function useRejectReplenishment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      StockReplenishmentService.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Permintaan ditolak");
    },
    onError: (err) => {
      const msg =
        (err as { message?: string })?.message ?? "Gagal menolak permintaan.";
      toast.error(msg);
    },
  });
}
