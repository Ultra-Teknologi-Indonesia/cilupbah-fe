"use client";

import * as React from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteFulfillmentOrder } from "@/hooks/proses-pesanan/use-fulfillment";

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return fallback;
}

export function DeleteOrderDialog({
  open,
  onOpenChange,
  orderId,
  orderNo,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  orderNo?: string | null;
  onDeleted?: () => void;
}) {
  const [reason, setReason] = React.useState("");
  const deleteOrder = useDeleteFulfillmentOrder();

  React.useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  const handleConfirm = () => {
    if (!orderId) return;
    deleteOrder.mutate(
      { orderId, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(
            `Pesanan ${orderNo ?? ""} dihapus permanen.`.replace(/\s+/g, " "),
          );
          onOpenChange(false);
          onDeleted?.();
        },
        onError: (e) => toast.error(errMsg(e, "Gagal menghapus pesanan.")),
      },
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Hapus Pesanan?"
      description={`Pesanan ${orderNo ?? orderId ?? ""} — stok yang sudah di-pick akan dikembalikan ke rak asal. Pesanan akan dihapus permanen dari sistem dan TIDAK akan ter-download ulang dari marketplace.`}
      confirmLabel="Hapus Pesanan"
      cancelLabel="Batal"
      variant="destructive"
      loading={deleteOrder.isPending}
      onConfirm={handleConfirm}
    >
      <div className="space-y-1.5">
        <label
          htmlFor="delete-order-reason"
          className="text-xs font-medium text-muted-foreground"
        >
          Alasan (opsional)
        </label>
        <Textarea
          id="delete-order-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Tulis alasan penghapusan…"
          disabled={deleteOrder.isPending}
        />
      </div>
    </ConfirmDialog>
  );
}
