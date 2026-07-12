"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrderItem } from "@/types/pesanan/order";
import { useUpdateOrderItem } from "@/hooks/pesanan/use-order-actions";

interface EditOrderItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  item: OrderItem;
}

export function EditOrderItemDialog({
  open,
  onOpenChange,
  orderId,
  item,
}: EditOrderItemDialogProps) {
  const [sku, setSku] = React.useState(item.sku);
  const [description, setDescription] = React.useState(item.description ?? "");
  const [qty, setQty] = React.useState(String(item.qty_in_base));
  const [price, setPrice] = React.useState(String(item.price));

  const [prevOpen, setPrevOpen] = React.useState(open);
  const [prevItem, setPrevItem] = React.useState(item);
  if (open !== prevOpen || item !== prevItem) {
    setPrevOpen(open);
    setPrevItem(item);
    if (open) {
      setSku(item.sku);
      setDescription(item.description ?? "");
      setQty(String(item.qty_in_base));
      setPrice(String(item.price));
    }
  }

  const updateItem = useUpdateOrderItem();

  const handleSubmit = () => {
    updateItem.mutate(
      {
        orderId,
        itemId: item.id,
        payload: {
          sku: sku.trim() || undefined,
          description: description.trim() || undefined,
          qty_in_base: Number(qty) || undefined,
          price: Number(price) || undefined,
        },
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={updateItem.isPending ? undefined : onOpenChange}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Item Pesanan</DialogTitle>
          <DialogDescription>
            Perubahan hanya berlaku di sistem internal (Jubelio) dan tidak
            dikirim ke marketplace.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-sku">SKU</Label>
            <Input
              id="edit-sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="SKU"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-desc">Deskripsi</Label>
            <Input
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nama produk / deskripsi"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="edit-qty">Qty</Label>
              <Input
                id="edit-qty"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Harga</Label>
              <Input
                id="edit-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateItem.isPending}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={updateItem.isPending}
          >
            {updateItem.isPending && <Loader2Icon className="animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
