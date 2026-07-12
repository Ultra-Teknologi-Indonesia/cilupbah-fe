"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PurchaseOrderService } from "@/services/transaksi-pembelian/purchase-order.service";
import type { ReceivePOPayload } from "@/services/transaksi-pembelian/purchase-order.service";
import { apiError } from "@/lib/toast";

export function useReceivePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReceivePOPayload }) =>
      PurchaseOrderService.receive(id, data),
    onSuccess: () => {
      toast.success("Penerimaan barang berhasil disimpan");
      qc.invalidateQueries({ queryKey: ["purchase-order"] });
      qc.invalidateQueries({ queryKey: ["inbound"] });
      qc.invalidateQueries({ queryKey: ["inbounds"] });
    },
    onError: (err) =>
      apiError(err, "Gagal menyimpan penerimaan"),
  });
}
