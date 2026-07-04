"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

export function openMarketplaceLabelInTab(label: LabelResult): boolean {
  if (label.type === "url" && label.url) {
    window.open(label.url, "_blank");
    return true;
  }
  if (label.type === "base64" && label.document_base64) {
    const ct = label.content_type || "application/pdf";
    const dataUrl = `data:${ct};base64,${label.document_base64}`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(
        `<!doctype html><html><head><title>Label Pengiriman</title></head>` +
          `<body style="margin:0"><iframe src="${dataUrl}" style="width:100%;height:100vh;border:none"></iframe></body></html>`,
      );
      win.document.close();
    }
    return true;
  }
  return false;
}

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
    onSuccess: (result) => {
      if (result.label) {
        const opened = openMarketplaceLabelInTab(result.label);
        if (!opened) {
          toast.info("Label diterima tetapi format tidak dikenali.");
        }
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
    onError: (err: Error) => {
      toast.error(err.message || "Panggilan driver Shopee gagal.");
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
    onError: (err: Error) => {
      toast.error(err.message || "Gagal retry panggilan driver.");
    },
  });
}
