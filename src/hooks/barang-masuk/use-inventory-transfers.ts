"use client";

import { useQuery } from "@tanstack/react-query";
import { InventoryTransferService } from "@/services/barang-masuk/inventory-transfer.service";
import type { InventoryTransferListParams } from "@/types/barang-masuk/inventory-transfer";

const STALE = 30 * 1000;

export function useIncomingTransfers(params: InventoryTransferListParams = {}) {
  return useQuery({
    queryKey: ["inventory-transfer", "incoming", params],
    queryFn: () => InventoryTransferService.listIncoming(params),
    staleTime: STALE,
  });
}

export function useIncomingTransferDetail(id?: string) {
  return useQuery({
    queryKey: ["inventory-transfer", "detail", id],
    queryFn: () => InventoryTransferService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  });
}
