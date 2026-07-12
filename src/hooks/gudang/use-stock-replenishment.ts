"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiError } from "@/lib/toast";
import { StockReplenishmentService } from "@/services/gudang/stock-replenishment.service";
import type {
  AcceptReplenishmentPayload,
  AddReplenishmentItemPayload,
  StockReplenishmentListParams,
  UpdateReplenishmentItemPayload,
} from "@/types/gudang/stock-replenishment";

const KEYS = {
  all: ["stock-replenishment"] as const,
  list: (params: StockReplenishmentListParams) =>
    [...KEYS.all, "list", params] as const,
  detail: (id: string) => [...KEYS.all, "detail", id] as const,
  pendingCount: () => [...KEYS.all, "pending-count"] as const,
};

export function useStockReplenishments(params: StockReplenishmentListParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => StockReplenishmentService.list(params),
  });
}

export function useStockReplenishmentDetail(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => StockReplenishmentService.detail(id),
    enabled: !!id,
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
      apiError(err, "Gagal menyetujui permintaan.");
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
      apiError(err, "Gagal menolak permintaan.");
    },
  });
}

function useItemMutation<TVars extends { id: string }>(
  mutationFn: (vars: TVars) => Promise<unknown>,
  successMessage: string,
  fallbackError: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(vars.id) });
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success(successMessage);
    },
    onError: (err) => {
      apiError(err, fallbackError);
    },
  });
}

export function useAddReplenishmentItem() {
  return useItemMutation(
    ({ id, payload }: { id: string; payload: AddReplenishmentItemPayload }) =>
      StockReplenishmentService.addItem(id, payload),
    "Item ditambahkan",
    "Gagal menambahkan item.",
  );
}

export function useUpdateReplenishmentItem() {
  return useItemMutation(
    ({
      id,
      itemId,
      payload,
    }: {
      id: string;
      itemId: string;
      payload: UpdateReplenishmentItemPayload;
    }) => StockReplenishmentService.updateItem(id, itemId, payload),
    "Item diperbarui",
    "Gagal memperbarui item.",
  );
}

export function useRemoveReplenishmentItem() {
  return useItemMutation(
    ({ id, itemId }: { id: string; itemId: string }) =>
      StockReplenishmentService.removeItem(id, itemId),
    "Item dihapus",
    "Gagal menghapus item.",
  );
}
