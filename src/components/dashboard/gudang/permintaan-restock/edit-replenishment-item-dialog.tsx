"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateReplenishmentItem } from "@/hooks/gudang/use-stock-replenishment";
import type { StockReplenishmentItem } from "@/types/gudang/stock-replenishment";

interface Props {
  requestId: string;
  item: StockReplenishmentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditReplenishmentItemDialog({
  requestId,
  item,
  open,
  onOpenChange,
}: Props) {
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState("");
  const [seededId, setSeededId] = useState<string | null>(null);
  const updateMut = useUpdateReplenishmentItem();

  if (item && item.id !== seededId) {
    setSeededId(item.id);
    setQty(String(item.qty));
    setReason(item.reason ?? "");
  }

  function handleClose() {
    if (updateMut.isPending) return;
    onOpenChange(false);
  }

  async function handleSubmit() {
    if (!item) return;
    const qtyNum = Number(qty);
    if (!Number.isFinite(qtyNum) || qtyNum < 1) return;

    await updateMut.mutateAsync({
      id: requestId,
      itemId: item.id,
      payload: {
        qty: Math.trunc(qtyNum),
        reason: reason.trim() || null,
      },
    });
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => (!v ? handleClose() : onOpenChange(v))}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Item</DialogTitle>
          <DialogDescription>
            {item?.product_name ??
              item?.sku ??
              "Perbarui jumlah dan alasan permintaan."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-item-qty">Jumlah</Label>
            <Input
              id="edit-item-qty"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-item-reason">Alasan (opsional)</Label>
            <Textarea
              id="edit-item-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Alasan permintaan pengisian…"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={updateMut.isPending}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={updateMut.isPending || Number(qty) < 1}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
