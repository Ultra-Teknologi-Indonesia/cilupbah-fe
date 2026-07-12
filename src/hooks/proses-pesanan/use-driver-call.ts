"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiError } from "@/lib/toast";
import { OutboundService } from "@/services/proses-pesanan/outbound.service";

type LabelResult = {
  type: string;
  url?: string;
  document_base64?: string;
  content_type?: string;
  source?: string;
};

export type PrintWithDriverCallResult = {
  driver_call_status: "pending" | "success" | "failed";
  driver_call_message: string | null;
  driver_call_attempted_at: string | null;
  label: LabelResult | null;
  label_preparing?: boolean;
  label_error?: string;
};

export function usePrintWithDriverCall() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      orderId: string;
      documentType?: string;
      documentSize?: string;
      forceLabel?: boolean;
    }) =>
      OutboundService.printWithDriverCall(data.orderId, {
        document_type: data.documentType,
        document_size: data.documentSize,
        force_label: data.forceLabel,
      }),
    onSuccess: (result, variables) => {
      if (result.label) {
        window.open(
          `/dashboard/document-preview/shipping-label/${variables.orderId}`,
          "_blank",
          "noopener,noreferrer",
        );
      } else if (result.label_preparing) {
        toast.warning(
          "Driver terpanggil. Label masih disiapkan Shopee, coba unduh lagi dalam beberapa detik.",
        );
      } else if (result.label_error) {
        toast.warning(`Driver terpanggil. Label gagal diambil: ${result.label_error}`);
      }

      if (result.driver_call_status === "success") {
        toast.success("Driver Shopee berhasil dipanggil.");
      }

      qc.invalidateQueries({ queryKey: ["fulfillment"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => {
      apiError(err, "Panggilan driver Shopee gagal.");
    },
  });
}

export function useRetryDriverCall() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => OutboundService.retryDriverCall(orderId),
    onSuccess: () => {
      toast.success("Panggilan driver Shopee dicoba ulang.");
      qc.invalidateQueries({ queryKey: ["fulfillment"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => {
      apiError(err, "Gagal retry panggilan driver.");
    },
  });
}
