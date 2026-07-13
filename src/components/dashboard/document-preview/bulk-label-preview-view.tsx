"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  DownloadIcon,
  Loader2,
  PrinterIcon,
  RefreshCcwIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OutboundService } from "@/services/proses-pesanan/outbound.service";
import type {
  BulkLabelBatch,
  BulkLabelItemStatus,
} from "@/types/proses-pesanan/bulk-label";
import { apiError } from "@/lib/toast";

const CHANNEL_LABEL: Record<string, string> = {
  shopee: "Shopee",
  tiktok: "TikTok",
  lazada: "Lazada",
  woocommerce: "WooCommerce",
  manual: "Manual",
};

const ITEM_STATUS_TEXT: Record<BulkLabelItemStatus, string> = {
  pending: "Menunggu",
  downloading: "Mengunduh",
  waiting_shopee_prep: "Menunggu Shopee",
  done: "Selesai",
  failed: "Gagal",
};

const REASON_TEXT: Record<string, string> = {
  no_awb: "Belum ada resi",
  channel_unsupported: "Kanal belum didukung",
  shopee_prep_timeout: "Shopee timeout",
  self_design: "Butuh label kustom",
  batch_crashed: "Batch terhenti",
  shopee_prep_failed: "Shopee gagal siapkan",
};

function itemStatusVariant(
  status: BulkLabelItemStatus,
): "success" | "warning" | "destructive" | "outline" {
  switch (status) {
    case "done":
      return "success";
    case "failed":
      return "destructive";
    case "waiting_shopee_prep":
    case "downloading":
      return "warning";
    default:
      return "outline";
  }
}

function humanizeReason(reason: string | null): string {
  if (!reason) return "—";
  return REASON_TEXT[reason] ?? reason;
}

export function BulkLabelPreviewView({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [retrying, setRetrying] = React.useState(false);

  const { data, error, isLoading } = useQuery<BulkLabelBatch>({
    queryKey: ["bulk-label-batch", batchId],
    queryFn: () => OutboundService.getBulkShippingLabelBatch(batchId),
    refetchInterval: (q) =>
      q.state.data?.status === "processing" ? 2000 : false,
    refetchIntervalInBackground: true,
  });

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const res = await OutboundService.retryFailedBulkShippingLabels(batchId);
      toast.success("Batch baru untuk item gagal dimulai.");
      router.replace(
        `/dashboard/document-preview/shipping-label-bulk-async/${res.batch_id}`,
      );
    } catch (err) {
      apiError(err, "Gagal mencoba ulang.");
    } finally {
      setRetrying(false);
    }
  };

  const handlePrint = () => {
    const iframe = document.getElementById(
      "bulk-label-frame",
    ) as HTMLIFrameElement | null;
    iframe?.contentWindow?.print();
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-sm">Memuat status batch…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 text-destructive">
        <XCircleIcon className="size-8" />
        <p className="text-sm">Gagal memuat status batch.</p>
      </div>
    );
  }

  const isReady = data.status === "ready";
  const isFailed = data.status === "failed";
  const isProcessing = data.status === "processing";
  const failedCount = data.items.filter((i) => i.status === "failed").length;
  const hasRecoverableFailure = data.items.some(
    (i) =>
      i.status === "failed" &&
      (i.reason === "shopee_prep_timeout" || i.reason === "batch_crashed"),
  );

  return (
    <div className="flex h-full min-h-screen flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          {isProcessing && (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          )}
          {isReady && <CheckCircle2Icon className="size-5 text-success" />}
          {isFailed && (
            <AlertTriangleIcon className="size-5 text-destructive" />
          )}
          <div>
            <p className="text-sm font-semibold">
              {isProcessing && "Menyiapkan label…"}
              {isReady && "Label siap"}
              {isFailed && "Batch gagal"}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.done}/{data.total} selesai
              {data.waiting_shopee > 0 &&
                ` · ${data.waiting_shopee} menunggu Shopee`}
              {failedCount > 0 && ` · ${failedCount} gagal`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasRecoverableFailure && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={retrying}
              className="rounded-full"
            >
              {retrying ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCcwIcon className="size-4" />
              )}
              Coba Ulang yang Gagal
            </Button>
          )}
          {isReady && data.pdf_url && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrint}
                className="rounded-full"
              >
                <PrinterIcon className="size-4" />
                Cetak
              </Button>
              <Button asChild size="sm" className="rounded-full">
                <a href={data.pdf_url} download>
                  <DownloadIcon className="size-4" />
                  Unduh PDF
                </a>
              </Button>
            </>
          )}
        </div>
      </div>

      {isReady && data.pdf_url ? (
        <div className="flex-1 bg-muted/40">
          <iframe
            id="bulk-label-frame"
            src={data.pdf_url}
            className="h-[calc(100vh-4rem)] w-full border-0"
            title="Label pengiriman"
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-4 py-4">
          <Table containerClassName="rounded-xl border border-border/60">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>No. Pesanan</TableHead>
                <TableHead>Kanal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.order_id}>
                  <TableCell className="font-mono text-xs">
                    {item.order_id}
                  </TableCell>
                  <TableCell>
                    {CHANNEL_LABEL[item.channel] ?? item.channel}
                  </TableCell>
                  <TableCell>
                    <Badge variant={itemStatusVariant(item.status)}>
                      {ITEM_STATUS_TEXT[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {humanizeReason(item.reason)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
