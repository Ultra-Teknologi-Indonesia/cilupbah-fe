"use client";

import * as React from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteFulfillmentOrder } from "@/hooks/proses-pesanan/use-fulfillment";
import { apiError } from "@/lib/toast";

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

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setReason("");
  }

  const handleConfirm = () => {
    if (!orderId || !reason.trim()) return;
    deleteOrder.mutate(
      { orderId, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success(
            `Pesanan ${orderNo ?? ""} dihapus dari proses.`.replace(
              /\s+/g,
              " ",
            ),
          );
          onOpenChange(false);
          onDeleted?.();
        },
        onError: (e) => apiError(e, "Gagal menghapus pesanan."),
      },
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Hapus Pesanan?"
      description={`Pesanan ${orderNo ?? orderId ?? ""} dikeluarkan dari proses (bukan dihapus permanen). Bila masih di picking → masuk tab "Gagal Picking" untuk ditangani admin; bila sudah packing/pengiriman → kembali ke tahap sebelumnya. Stok yang sudah di-pick dikembalikan ke rak asal.`}
      confirmLabel="Hapus Pesanan"
      cancelLabel="Batal"
      variant="destructive"
      loading={deleteOrder.isPending}
      confirmDisabled={!reason.trim()}
      onConfirm={handleConfirm}
    >
      <div className="space-y-1.5">
        <label
          htmlFor="delete-order-reason"
          className="text-xs font-medium text-muted-foreground"
        >
          Alasan <span className="text-destructive">*</span>{" "}
          <span className="font-normal">(mis. barang apa yang minus)</span>
        </label>
        <Textarea
          id="delete-order-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Wajib: tulis alasan penghapusan / barang yang minus…"
          disabled={deleteOrder.isPending}
        />
      </div>
    </ConfirmDialog>
  );
}
