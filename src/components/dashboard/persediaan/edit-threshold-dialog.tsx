"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateThresholds } from "@/hooks/persediaan/use-inventory-settings";
import type { InventorySettingProduct } from "@/types/persediaan/inventory-setting";

interface Props {
  product: InventorySettingProduct | null;
  onOpenChange: (open: boolean) => void;
}

export function EditThresholdDialog({ product, onOpenChange }: Props) {
  const update = useUpdateThresholds();
  const [minStock, setMinStock] = React.useState("0");
  const [safeStock, setSafeStock] = React.useState("0");
  const [syncedId, setSyncedId] = React.useState<string | null>(null);

  if (product && product.itemId !== syncedId) {
    setSyncedId(product.itemId);
    setMinStock(String(product.minStock));
    setSafeStock(String(product.safeStock));
  }

  const handleSave = async () => {
    if (!product) return;
    await update.mutateAsync({
      itemId: product.itemId,
      minStock: Number.parseInt(minStock, 10) || 0,
      safeStock: Number.parseInt(safeStock, 10) || 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Batas Stok</DialogTitle>
          <DialogDescription>
            {product?.productName} — {product?.sku}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label>Batas Stok Menipis</Label>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Batas Stok Aman</Label>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={safeStock}
              onChange={(e) => setSafeStock(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={update.isPending}
          >
            {update.isPending && (
              <Loader2Icon className="size-4 animate-spin" />
            )}
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
