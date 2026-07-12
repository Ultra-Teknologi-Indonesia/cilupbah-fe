"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InventoryTransferService } from "@/services/barang-masuk/inventory-transfer.service";
import { apiError } from "@/lib/toast";

interface ReceiveTransferPayload {
  received_by: string;
  items?: {
    item_id: string;
    received_qty: number;
    rejected_qty?: number;
    condition?: string;
    notes?: string;
  }[];
}

export function useReceiveTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReceiveTransferPayload }) =>
      InventoryTransferService.receive(id, data),
    onSuccess: () => {
      toast.success("Transfer berhasil diterima");
      qc.invalidateQueries({ queryKey: ["inventory-transfer"] });
      qc.invalidateQueries({ queryKey: ["inbound"] });
    },
    onError: (err) =>
      apiError(err, "Gagal menerima transfer"),
  });
}
