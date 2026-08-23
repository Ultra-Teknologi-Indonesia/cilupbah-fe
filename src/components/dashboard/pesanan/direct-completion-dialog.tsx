"use client";

import { useMemo, useState } from "react";
import { Loader2, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useCompleteOrdersDirectly,
  useDirectCompletionPreview,
} from "@/hooks/pesanan/use-direct-completion";
import type {
  DirectCompletionBlocked,
  DirectCompletionItem,
  DirectCompletionPreview,
} from "@/types/pesanan/direct-completion";

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Selesaikan Pesanan</DialogTitle>
          <DialogDescription>
            Stok dipotong dari Gudang Kecil saat pesanan ditandai selesai.
            Status di marketplace tidak berubah.
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

  const [result, setResult] = useState<DirectCompletionBlocked[] | null>(null);

  const data: DirectCompletionPreview | null = preview.data?.data ?? null;

  const activeItems = useMemo(
    () => (data?.items ?? []).filter((item) => item.qty_completable > 0),
    [data],
  );

  const submit = () => {
    if (!data) return;

    complete.mutate(
      { orderIds: data.completable_order_ids, allocations: [] },
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
  const completableCount = data?.completable_order_ids.length ?? 0;

  return (
    <>
      <ScrollArea className="max-h-[55vh] pr-3">
        <div className="space-y-3">
          {blocked.length > 0 && <BlockedPanel blocked={blocked} />}

          {completableCount === 0 ? (
            <p className="rounded-xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
              Tidak ada pesanan yang bisa diselesaikan langsung.
            </p>
          ) : (
            <>
              <p className="text-sm">
                <span className="font-medium">{completableCount} pesanan</span>{" "}
                akan ditandai selesai dan stoknya dipotong:
              </p>

              <div className="space-y-2">
                {activeItems.map((item) => (
                  <ItemSummary key={item.item_id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button
          onClick={submit}
          disabled={completableCount === 0 || complete.isPending}
        >
          {complete.isPending && (
            <Loader2 className="mr-2 size-4 animate-spin" />
          )}
          Selesaikan
        </Button>
      </DialogFooter>
    </>
  );
}

function ItemSummary({ item }: { item: DirectCompletionItem }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.sku}</p>
          {item.name && (
            <p className="truncate text-xs text-muted-foreground">
              {item.name}
            </p>
          )}
        </div>
        <p className="text-xs font-medium tabular-nums">
          {item.qty_completable} pcs
        </p>
      </div>

      {item.suggested.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Diambil dari{" "}
          {item.suggested
            .map((row) => `${row.bin_code ?? "rak"} (${row.qty})`)
            .join(" · ")}
        </p>
      )}
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
