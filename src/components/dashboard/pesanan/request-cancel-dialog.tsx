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
  useCancelReasons,
  useRequestChannelCancel,
} from "@/hooks/pesanan/use-order-actions";
import { tiktokReasonStatus } from "@/lib/pesanan/cancel-eligibility";
import type { Order } from "@/types/pesanan/order";

interface RequestCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Pick<
    Order,
    | "id"
    | "salesorder_no"
    | "source"
    | "channel_shop_id"
    | "channel_status"
    | "channel_status_raw"
    | "is_paid"
  >;
}

export function RequestCancelDialog({
  open,
  onOpenChange,
  order,
}: RequestCancelDialogProps) {
  const [reason, setReason] = React.useState<string>("");

  const marketplace = order.source ?? undefined;
  const statusContext =
    order.source === "tiktok"
      ? tiktokReasonStatus(order)
      : (order.channel_status_raw ?? order.channel_status ?? undefined);

  const reasonsQuery = useCancelReasons(marketplace, {
    shopId: order.channel_shop_id,
    status: statusContext,
    enabled: open,
  });

  const requestCancel = useRequestChannelCancel();

  const reasons = reasonsQuery.data?.data ?? [];

  const handleOpenChange = (next: boolean) => {
    if (!next) setReason("");
    onOpenChange(next);
  };

  const handleConfirm = () => {
    if (!reason) return;
    requestCancel.mutate(
      { orderId: order.id, reason },
      { onSuccess: () => handleOpenChange(false) },
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Ajukan Pembatalan ke Marketplace"
      description={`Pesanan ${order.salesorder_no ?? ""} akan diajukan pembatalannya ke ${
        marketplace ?? "marketplace"
      }. Pilih alasan sesuai ketentuan channel.`}
      confirmLabel="Ajukan Pembatalan"
      variant="destructive"
      loading={requestCancel.isPending}
      confirmDisabled={!reason || reasonsQuery.isLoading}
      onConfirm={handleConfirm}
    >
      <div className="space-y-2">
        {reasonsQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Memuat alasan pembatalan…
          </div>
        ) : reasonsQuery.isError ? (
          <p className="text-sm text-destructive">
            Gagal memuat alasan pembatalan. Coba tutup lalu buka lagi.
          </p>
        ) : reasons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tidak ada alasan pembatalan yang tersedia untuk status pesanan ini.
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
    </ConfirmDialog>
  );
}
