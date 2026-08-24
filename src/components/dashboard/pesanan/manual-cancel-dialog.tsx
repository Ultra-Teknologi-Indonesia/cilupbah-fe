"use client";

import * as React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCancelManualOrder } from "@/hooks/pesanan/use-order-actions";
import type { Order } from "@/types/pesanan/order";

interface ManualCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onDone?: () => void;
}

export function ManualCancelDialog({
  open,
  onOpenChange,
  order,
  onDone,
}: ManualCancelDialogProps) {
  const [reason, setReason] = React.useState<string>("");
  const cancelManual = useCancelManualOrder();

  const handleOpenChange = (next: boolean) => {
    if (!next) setReason("");
    onOpenChange(next);
  };

  const handleConfirm = () => {
    cancelManual.mutate(
      { orderId: order.id, reason },
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
      title="Batalkan Pesanan Manual"
      description={`Anda akan membatalkan secara langsung pesanan ${order.salesorder_no}. Proses ini akan otomatis mengembalikan stok ke status tersedia dan mencabut pesanan dari antrean gudang.`}
      confirmLabel="Batalkan Pesanan"
      variant="destructive"
      loading={cancelManual.isPending}
      onConfirm={handleConfirm}
    >
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="reason">Alasan Pembatalan (Opsional)</Label>
          <Input
            id="reason"
            placeholder="Contoh: Permintaan pembeli, stok habis fisik"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>
    </ConfirmDialog>
  );
}
