"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiError } from "@/lib/toast";
import { ManualOrderService } from "@/services/pesanan/manual-order.service";

export function useCreateManualOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ManualOrderService.create,
    onSuccess: () => {
      toast.success("Pesanan berhasil dibuat");
      qc.invalidateQueries({ queryKey: ["pesanan"] });
    },
    onError: (err) => apiError(err, "Gagal membuat pesanan"),
  });
}
