"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ManualOrderService } from "@/services/pesanan/manual-order.service";

export function useCreateManualOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ManualOrderService.create,
    onSuccess: () => {
      toast.success("Pesanan berhasil dibuat");
      qc.invalidateQueries({ queryKey: ["order"] });
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message || "Gagal membuat pesanan",
      ),
  });
}
