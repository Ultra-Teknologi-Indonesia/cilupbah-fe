"use client";

import { useMemo, useState } from "react";
import { Loader2Icon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserSelect } from "@/components/dashboard/shared/user-select";
import { useReceiveTransfer } from "@/hooks/barang-masuk/use-receive-transfer";
import type { Inbound } from "@/types/barang-masuk/inbound";

interface TerimaTransferDialogProps {
  inbound: Inbound | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TerimaTransferDialog({
  inbound,
  open,
  onOpenChange,
  onSuccess,
}: TerimaTransferDialogProps) {
  const receive = useReceiveTransfer();
  const [receivedBy, setReceivedBy] = useState("");

  const items = useMemo(() => inbound?.items ?? [], [inbound]);

  const [qtyMap, setQtyMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((i) => [i.item_id, i.expected_qty])),
  );

  const setQty = (itemId: string, expected: number, raw: string) => {
    const n = Math.max(0, Math.min(expected, Number(raw) || 0));
    setQtyMap((prev) => ({ ...prev, [itemId]: n }));
  };

  const canSubmit = !!inbound?.source_id && !!receivedBy && items.length > 0;

  const handleSubmit = () => {
    if (!inbound?.source_id) return;
    receive.mutate(
      {
        id: inbound.source_id,
        data: {
          received_by: receivedBy,
          items: items.map((i) => ({
            item_id: i.item_id,
            received_qty: qtyMap[i.item_id] ?? i.expected_qty,
          })),
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReceivedBy("");
          onSuccess?.();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            Terima Transfer {inbound?.reference_number ?? inbound?.transaction_number}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Diterima Oleh
            </Label>
            <UserSelect
              value={receivedBy}
              onChange={setReceivedBy}
              defaultToSelf
              placeholder="Pilih penerima…"
            />
          </div>

          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty Kirim</TableHead>
                  <TableHead className="w-28 text-right">Qty Terima</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((i) => (
                  <TableRow key={i.item_id}>
                    <TableCell className="font-medium">
                      {i.variant?.sku ?? i.item_id}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {i.expected_qty}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={0}
                        max={i.expected_qty}
                        value={qtyMap[i.item_id] ?? i.expected_qty}
                        onChange={(e) =>
                          setQty(i.item_id, i.expected_qty, e.target.value)
                        }
                        className="h-8 text-right"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={receive.isPending}
          >
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || receive.isPending}>
            {receive.isPending && (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            )}
            Terima
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
