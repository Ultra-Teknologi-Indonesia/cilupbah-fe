"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBulkRequestChannelCancel,
  useOrderCancelReasons,
} from "@/hooks/pesanan/use-order-actions";
import {
  canRequestChannelCancel,
  tiktokStatusGroup,
} from "@/lib/pesanan/cancel-eligibility";
import type { Order } from "@/types/pesanan/order";

interface BulkRequestCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  onDone?: () => void;
}

type Analysis = { error: string } | { source: string };

export function BulkRequestCancelDialog({
  open,
  onOpenChange,
  orders,
  onDone,
}: BulkRequestCancelDialogProps) {
  const [reason, setReason] = React.useState<string>("");

  const eligible = React.useMemo(
    () => orders.filter(canRequestChannelCancel),
    [orders],
  );

  const analysis = React.useMemo<Analysis>(() => {
    if (eligible.length === 0) {
      return {
        error:
          "Tidak ada pesanan marketplace yang bisa dibatalkan dari pilihan ini.",
      };
    }
    const sources = Array.from(new Set(eligible.map((o) => o.source)));
    if (sources.length > 1) {
      return {
        error: `Pilih pesanan dari satu channel saja (terpilih: ${sources.join(", ")}).`,
      };
    }
    const source = sources[0] as string;
    if (source === "lazada") {
      const shops = Array.from(new Set(eligible.map((o) => o.channel_shop_id)));
      if (shops.length > 1) {
        return {
          error: "Untuk Lazada, pilih pesanan dari satu toko yang sama.",
        };
      }
      return { source };
    }
    if (source === "tiktok") {
      const groups = Array.from(
        new Set(
          eligible.map((o) =>
            tiktokStatusGroup(o.channel_status_raw, o.is_paid),
          ),
        ),
      );
      if (groups.length > 1) {
        return {
          error:
            "Untuk TikTok, pilih pesanan dengan status seragam (semua belum bayar atau semua sudah bayar).",
        };
      }
      return { source };
    }
    return { source };
  }, [eligible]);

  const hasError = "error" in analysis;
  const marketplace = hasError ? undefined : analysis.source;

  const reasonsQuery = useOrderCancelReasons(
    hasError ? undefined : eligible[0]?.id,
    { enabled: open && !hasError },
  );

  const bulkCancel = useBulkRequestChannelCancel();
  const reasons = reasonsQuery.data?.data ?? [];

  const handleOpenChange = (next: boolean) => {
    if (!next) setReason("");
    onOpenChange(next);
  };

  const handleConfirm = () => {
    if (hasError || !reason) return;
    bulkCancel.mutate(
      { orderIds: eligible.map((o) => o.id), reason },
      {
        onSuccess: () => {
          handleOpenChange(false);
          onDone?.();
        },
      },
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Ajukan Pembatalan Massal"
      description={
        hasError
          ? undefined
          : `${eligible.length} pesanan ${marketplace} akan diajukan pembatalannya ke marketplace.`
      }
      confirmLabel="Ajukan Pembatalan"
      variant="destructive"
      loading={bulkCancel.isPending}
      confirmDisabled={hasError || !reason || reasonsQuery.isLoading}
      onConfirm={handleConfirm}
    >
      {hasError ? (
        <p className="text-sm text-muted-foreground">{analysis.error}</p>
      ) : (
        <div className="space-y-2">
          {eligible.length < orders.length && (
            <p className="text-xs text-muted-foreground">
              {orders.length - eligible.length} pesanan dilewati (tidak memenuhi
              syarat pembatalan).
            </p>
          )}
          {reasonsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Memuat alasan pembatalan…
            </div>
          ) : reasonsQuery.isError ? (
            <p className="text-sm text-destructive">
              Gagal memuat alasan pembatalan. Coba lagi.
            </p>
          ) : reasons.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ada alasan pembatalan yang tersedia untuk pesanan ini.
            </p>
          ) : (
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih alasan pembatalan" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r.key} value={r.key}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </ConfirmDialog>
  );
}
