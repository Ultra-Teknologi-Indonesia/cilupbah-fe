"use client";

import * as React from "react";
import { Loader2Icon, SplitIcon } from "lucide-react";

import { apiError } from "@/lib/toast";

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
import { cn } from "@/lib/utils";
import { OutboundService } from "@/services/proses-pesanan/outbound.service";
import { useSplitPickItem } from "@/hooks/proses-pesanan/use-fulfillment";
import type { PicklistItem } from "@/types/proses-pesanan/fulfillment";

interface BinCandidate {
  bin_id: string;
  bin_code: string;
  on_hand: number;
}

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return fallback;
}

export function PecahRakDialog({
  open,
  onOpenChange,
  picklistId,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  picklistId: string;
  item: PicklistItem;
}) {
  const [candidates, setCandidates] = React.useState<BinCandidate[]>([]);
  const [qtyByBin, setQtyByBin] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const splitPick = useSplitPickItem();

  const remaining = Math.max(0, item.qtyOrdered - item.qtyPicked);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
     
    setLoadError(null);
     
    setQtyByBin({});
    OutboundService.scanForPick(picklistId, {
      sku: item.sku,
      bin_code: null,
      hint_active_bin_code: null,
    })
      .then((res) => {
        if (cancelled) return;
        setCandidates(res.candidates ?? []);
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(errMsg(e, "Gagal memuat kandidat rak."));
        setCandidates([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, picklistId, item.sku]);

  const parsedQtys = React.useMemo(() => {
    const list = candidates.map((c) => {
      const raw = qtyByBin[c.bin_code] ?? "";
      const n = raw === "" ? 0 : Number.parseInt(raw, 10);
      const qty = Number.isFinite(n) && n > 0 ? n : 0;
      const overAvailable = qty > c.on_hand;
      return { candidate: c, qty, overAvailable };
    });
    return list;
  }, [candidates, qtyByBin]);

  const totalUsed = parsedQtys.reduce((s, r) => s + r.qty, 0);
  const nonZeroCount = parsedQtys.filter((r) => r.qty > 0).length;
  const overRemaining = totalUsed > remaining;
  const anyOverAvailable = parsedQtys.some((r) => r.overAvailable);
  const canConfirm =
    !splitPick.isPending &&
    totalUsed > 0 &&
    !overRemaining &&
    !anyOverAvailable &&
    nonZeroCount >= 2;

  const setQty = (binCode: string, val: string) => {
    setQtyByBin((prev) => ({ ...prev, [binCode]: val }));
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    const allocations = parsedQtys
      .filter((r) => r.qty > 0)
      .map((r) => ({ binCode: r.candidate.bin_code, qty: r.qty }));
    splitPick.mutate(
      { picklistId, itemId: item.id, allocations },
      {
        onSuccess: () => onOpenChange(false),
        onError: (e) => apiError(e, "Gagal memecah rak."),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!splitPick.isPending) onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SplitIcon className="size-4 text-primary" />
            Pecah Rak
          </DialogTitle>
          <DialogDescription>
            Bagi pengambilan item ke beberapa rak. Minimal 2 rak dengan qty
            &gt; 0.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
          <div className="font-medium text-foreground">
            {item.name ?? item.sku}
          </div>
          <div className="mt-0.5 font-mono text-xs text-muted-foreground">
            {item.sku}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Sisa harus di-pick:{" "}
            <span className="font-semibold text-foreground">{remaining}</span>{" "}
            unit
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2Icon className="mr-2 size-4 animate-spin" />
            Memuat kandidat rak…
          </div>
        ) : loadError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {loadError}
          </div>
        ) : candidates.length === 0 ? (
          <div className="rounded-md border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
            Tidak ada kandidat rak untuk SKU ini.
          </div>
        ) : (
          <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto">
            {parsedQtys.map(({ candidate, qty: _qty, overAvailable }) => {
              const maxForBin = Math.min(candidate.on_hand, remaining);
              return (
                <div
                  key={candidate.bin_id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2",
                    overAvailable && "border-destructive/50 bg-destructive/5",
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-mono text-sm font-medium text-foreground">
                      {candidate.bin_code}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      tersedia {candidate.on_hand}
                    </span>
                  </div>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={maxForBin}
                    value={qtyByBin[candidate.bin_code] ?? ""}
                    onChange={(e) =>
                      setQty(candidate.bin_code, e.target.value)
                    }
                    placeholder="0"
                    className="w-24 text-right tabular-nums"
                    disabled={splitPick.isPending}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div
          className={cn(
            "flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm",
            (overRemaining || anyOverAvailable) &&
              "border-destructive/50 bg-destructive/5 text-destructive",
          )}
        >
          <span className="text-muted-foreground">
            Terpakai:{" "}
            <span
              className={cn(
                "font-semibold tabular-nums text-foreground",
                (overRemaining || anyOverAvailable) && "text-destructive",
              )}
            >
              {totalUsed}
            </span>{" "}
            / Sisa:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {remaining}
            </span>
          </span>
          {nonZeroCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {nonZeroCount} rak
            </span>
          )}
        </div>

        {overRemaining && (
          <p className="text-xs text-destructive">
            Total qty melebihi sisa yang harus di-pick.
          </p>
        )}
        {anyOverAvailable && (
          <p className="text-xs text-destructive">
            Salah satu qty melebihi stok tersedia di rak.
          </p>
        )}
        {!overRemaining && !anyOverAvailable && nonZeroCount === 1 && (
          <p className="text-xs text-muted-foreground">
            Isi minimal 2 rak untuk pecah pengambilan.
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={splitPick.isPending}
          >
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            {splitPick.isPending && (
              <Loader2Icon className="size-4 animate-spin" />
            )}
            Konfirmasi Pecah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
