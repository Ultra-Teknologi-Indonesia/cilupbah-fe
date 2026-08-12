"use client";

import { useMemo, useState } from "react";
import { Loader2, PlusIcon, TrashIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useCompleteOrdersDirectly,
  useDirectCompletionPreview,
} from "@/hooks/pesanan/use-direct-completion";
import type {
  DirectCompletionBlocked,
  DirectCompletionItem,
  DirectCompletionPreview,
} from "@/types/pesanan/direct-completion";

type DrawRow = { bin_id: string | null; qty: number };
type DrawState = Record<string, DrawRow[]>;

export function DirectCompletionDialog({
  open,
  onOpenChange,
  orderIds,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderIds: string[];
  onDone?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selesaikan Pesanan</DialogTitle>
          <DialogDescription>
            Pilih rak asal barang di Gudang Kecil. Stok dipotong saat pesanan
            ditandai selesai.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <DirectCompletionBody
            orderIds={orderIds}
            onClose={() => onOpenChange(false)}
            onDone={onDone}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DirectCompletionBody({
  orderIds,
  onClose,
  onDone,
}: {
  orderIds: string[];
  onClose: () => void;
  onDone?: () => void;
}) {
  const preview = useDirectCompletionPreview(orderIds, true);
  const complete = useCompleteOrdersDirectly();

  const [edited, setEdited] = useState<DrawState | null>(null);
  const [result, setResult] = useState<DirectCompletionBlocked[] | null>(null);

  const data: DirectCompletionPreview | null = preview.data?.data ?? null;

  const activeItems = useMemo(
    () => (data?.items ?? []).filter((item) => item.qty_completable > 0),
    [data],
  );

  const draws = useMemo<DrawState>(() => {
    if (edited) return edited;

    return Object.fromEntries(
      activeItems.map((item) => [
        item.item_id,
        item.suggested.length > 0
          ? item.suggested.map((row) => ({ bin_id: row.bin_id, qty: row.qty }))
          : [{ bin_id: null, qty: item.qty_completable }],
      ]),
    );
  }, [edited, activeItems]);

  const allocatedByItem = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const [itemId, rows] of Object.entries(draws)) {
      totals[itemId] = rows.reduce(
        (sum, row) => sum + (row.bin_id ? row.qty : 0),
        0,
      );
    }
    return totals;
  }, [draws]);

  const overdrawn = useMemo(() => {
    const flagged = new Set<string>();

    for (const item of activeItems) {
      const used: Record<string, number> = {};
      for (const row of draws[item.item_id] ?? []) {
        if (!row.bin_id) continue;
        used[row.bin_id] = (used[row.bin_id] ?? 0) + row.qty;
      }
      for (const bin of item.bins) {
        if ((used[bin.bin_id] ?? 0) > bin.on_hand) flagged.add(item.item_id);
      }
    }

    return flagged;
  }, [activeItems, draws]);

  const isValid =
    activeItems.length > 0 &&
    overdrawn.size === 0 &&
    activeItems.every(
      (item) => (allocatedByItem[item.item_id] ?? 0) === item.qty_completable,
    );

  const mutateDraws = (next: (current: DrawState) => DrawState) =>
    setEdited(next(draws));

  const setRow = (itemId: string, index: number, patch: Partial<DrawRow>) =>
    mutateDraws((current) => ({
      ...current,
      [itemId]: (current[itemId] ?? []).map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    }));

  const addRow = (itemId: string) =>
    mutateDraws((current) => ({
      ...current,
      [itemId]: [...(current[itemId] ?? []), { bin_id: null, qty: 0 }],
    }));

  const removeRow = (itemId: string, index: number) =>
    mutateDraws((current) => ({
      ...current,
      [itemId]: (current[itemId] ?? []).filter((_, i) => i !== index),
    }));

  const submit = () => {
    if (!data) return;

    const allocations = activeItems.map((item) => ({
      item_id: item.item_id,
      bins: (draws[item.item_id] ?? [])
        .filter((row) => row.bin_id && row.qty > 0)
        .map((row) => ({ bin_id: row.bin_id as string, qty: row.qty })),
    }));

    complete.mutate(
      { orderIds: data.completable_order_ids, allocations },
      {
        onSuccess: (res) => {
          const blocked = res.data?.blocked ?? [];

          if (blocked.length === 0) {
            onClose();
            onDone?.();
            return;
          }

          setResult(blocked);
        },
      },
    );
  };

  if (result) {
    return (
      <>
        <ResultPanel blocked={result} />
        <DialogFooter>
          <Button
            onClick={() => {
              onClose();
              onDone?.();
            }}
          >
            Tutup
          </Button>
        </DialogFooter>
      </>
    );
  }

  if (preview.isPending) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Menghitung kebutuhan stok...
      </div>
    );
  }

  const blocked = data?.blocked ?? [];

  return (
    <>
      <ScrollArea className="max-h-[55vh] pr-3">
        <div className="space-y-3">
          {blocked.length > 0 && <BlockedPanel blocked={blocked} />}

          {activeItems.length === 0 ? (
            <p className="rounded-xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
              Tidak ada pesanan yang bisa diselesaikan langsung.
            </p>
          ) : (
            activeItems.map((item) => (
              <ItemAllocator
                key={item.item_id}
                item={item}
                rows={draws[item.item_id] ?? []}
                allocated={allocatedByItem[item.item_id] ?? 0}
                overdrawn={overdrawn.has(item.item_id)}
                onChangeRow={(index, patch) => setRow(item.item_id, index, patch)}
                onAddRow={() => addRow(item.item_id)}
                onRemoveRow={(index) => removeRow(item.item_id, index)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button onClick={submit} disabled={!isValid || complete.isPending}>
          {complete.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Selesaikan
        </Button>
      </DialogFooter>
    </>
  );
}

function ItemAllocator({
  item,
  rows,
  allocated,
  overdrawn,
  onChangeRow,
  onAddRow,
  onRemoveRow,
}: {
  item: DirectCompletionItem;
  rows: DrawRow[];
  allocated: number;
  overdrawn: boolean;
  onChangeRow: (index: number, patch: Partial<DrawRow>) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
}) {
  const options = item.bins.map((bin) => ({
    value: bin.bin_id,
    label: bin.bin_code,
    hint: `${bin.on_hand} pcs`,
  }));

  const remaining = item.qty_completable - allocated;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.sku}</p>
          {item.name && (
            <p className="truncate text-xs text-muted-foreground">{item.name}</p>
          )}
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">
          Butuh {item.qty_completable} pcs
        </p>
      </div>

      <Separator className="my-3" />

      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <Combobox
              className="flex-1"
              options={options}
              value={row.bin_id}
              onChange={(value) => onChangeRow(index, { bin_id: value })}
              placeholder="Pilih rak"
              searchPlaceholder="Cari kode rak"
              emptyText="Tidak ada rak berisi SKU ini"
            />
            <Input
              type="number"
              min={0}
              className="w-24"
              value={row.qty}
              onChange={(event) =>
                onChangeRow(index, {
                  qty: Math.max(0, Number(event.target.value) || 0),
                })
              }
            />
            <Button
              variant="ghost"
              size="icon"
              disabled={rows.length <= 1}
              onClick={() => onRemoveRow(index)}
            >
              <TrashIcon className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onAddRow}>
          <PlusIcon className="mr-1.5 size-3.5" />
          Tambah rak
        </Button>

        {overdrawn ? (
          <span className="text-xs text-destructive">
            Melebihi stok yang ada di rak
          </span>
        ) : remaining !== 0 ? (
          <span className="text-xs text-warning">
            {remaining > 0
              ? `Kurang ${remaining} pcs`
              : `Lebih ${Math.abs(remaining)} pcs`}
          </span>
        ) : (
          <span className="text-xs text-success">Pas</span>
        )}
      </div>
    </div>
  );
}

function BlockedPanel({ blocked }: { blocked: DirectCompletionBlocked[] }) {
  return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-warning">
        <TriangleAlertIcon className="size-4" />
        {blocked.length} pesanan tidak ikut diselesaikan
      </div>
      <ul className="mt-2 space-y-1">
        {blocked.map((row) => (
          <li key={row.order_id ?? row.message} className="text-xs">
            <span className="font-medium">{row.salesorder_no ?? "-"}</span>
            <span className="text-muted-foreground"> — {row.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultPanel({ blocked }: { blocked: DirectCompletionBlocked[] }) {
  return (
    <div className="space-y-2 py-2">
      <p className="text-sm text-muted-foreground">
        Sebagian pesanan tidak bisa diselesaikan:
      </p>
      <ul className="space-y-1">
        {blocked.map((row) => (
          <li
            key={row.order_id ?? row.message}
            className="rounded-xl bg-muted px-3 py-2 text-xs"
          >
            <span className="font-medium">{row.salesorder_no ?? "-"}</span>
            <span className="text-muted-foreground"> — {row.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
