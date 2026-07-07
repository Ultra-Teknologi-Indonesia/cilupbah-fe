"use client";

import { DetailSkeleton } from "@/components/ui/page-skeleton";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  Loader2Icon,
  PackageIcon,
  RotateCcwIcon,
  ScanBarcodeIcon,
  SplitIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatPickingDuration } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageTitle } from "@/components/dashboard/page-title";
import {
  usePicklistDetail,
  useStartPicklist,
  usePickItem,
  useScanForPick,
  useCompletePicklist,
  useUnfailPickItem,
} from "@/hooks/proses-pesanan/use-fulfillment";
import { FailItemDialog } from "@/components/dashboard/proses-pesanan/picking/fail-item-dialog";
import { PecahRakDialog } from "@/components/dashboard/proses-pesanan/picking/pecah-rak-dialog";
import { DeleteOrderDialog } from "@/components/dashboard/proses-pesanan/shared/delete-order-dialog";
import type { PicklistItem } from "@/types/proses-pesanan/fulfillment";
import { ScanAutoflowBar } from "@/components/dashboard/shared/scan-autoflow-bar";
import { useQtyBumpQueue } from "@/hooks/proses-pesanan/use-qty-bump-queue";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { QtyConfirmInput } from "@/components/ui/qty-confirm-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { playScanFeedback } from "@/lib/scan-feedback";
import { BIN_CODE_PATTERN } from "@/lib/validators/bin-code";

const LIST_HREF = "/dashboard/proses-pesanan";

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return fallback;
}

function ItemImage({ src, alt }: { src: string | null; alt: string }) {
  const [errored, setErrored] = React.useState(false);
  if (!src || errored) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
        <PackageIcon className="size-5" />
      </div>
    );
  }
  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="48px"
        className="object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

function getItemStatus(
  picked: number,
  ordered: number,
  s: string | null | undefined,
) {
  if (s === "SHORT" || s === "REJECTED") return s;
  if (picked >= ordered && ordered > 0) return "COMPLETED";
  if (picked > 0) return "PARTIAL";
  if (s === "PICKED") return "COMPLETED";
  return "PENDING";
}

function isFailedStatus(s: string | null | undefined) {
  return s === "SHORT" || s === "REJECTED";
}

function PickingDurationLive({
  startedAt,
  completedAt,
  status,
}: {
  startedAt: string | null;
  completedAt: string | null;
  status: string;
}) {
  const [, forceTick] = React.useReducer((c: number) => c + 1, 0);

  React.useEffect(() => {
    if (status !== "IN_PROGRESS" || completedAt) return;
    const t = setInterval(forceTick, 60_000);
    return () => clearInterval(t);
  }, [status, completedAt]);

  return <>{formatPickingDuration(startedAt, completedAt, status)}</>;
}

export function PickingProsesView({ id }: { id: string }) {
  const router = useRouter();

  const binScanRef = React.useRef<HTMLInputElement>(null);
  const qtyInputRef = React.useRef<HTMLInputElement>(null);

  const [skuRefocusKey, setSkuRefocusKey] = React.useState(0);
  const [binScan, setBinScan] = React.useState("");
  const [scannedBinCode, setScannedBinCode] = React.useState<string | null>(
    null,
  );
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
  const [pickQty, setPickQty] = React.useState("");

  const [activePickMax, setActivePickMax] = React.useState(0);
  const [activeCandidates, setActiveCandidates] = React.useState<
    Array<{ bin_id: string; bin_code: string; on_hand: number }>
  >([]);
  const [activeChosenBinCode, setActiveChosenBinCode] = React.useState<
    string | null
  >(null);

  const { data: pl, isLoading, isError } = usePicklistDetail(id);
  const startPicklist = useStartPicklist();
  const pickItem = usePickItem();
  const scanForPick = useScanForPick();
  const completePicklist = useCompletePicklist();
  const unfailPickItem = useUnfailPickItem();

  const [failItemTarget, setFailItemTarget] =
    React.useState<PicklistItem | null>(null);
  const [pecahRakTarget, setPecahRakTarget] =
    React.useState<PicklistItem | null>(null);
  const [deleteOrderTarget, setDeleteOrderTarget] = React.useState<{
    orderId: string;
    orderNo: string | null;
  } | null>(null);

  const items = React.useMemo(() => pl?.items ?? [], [pl]);

  // Latest items snapshot for scan handlers (avoids stale closures on fast scan).
  const itemsRef = React.useRef(items);
  React.useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // itemId -> bin_code resolved by the last scanForPick, used by the +1 queue.
  const pickBinRef = React.useRef<Map<string, string>>(new Map());
  const commitPick = React.useCallback(
    (itemId: string, qty: number) => {
      const binCode = pickBinRef.current.get(itemId);
      if (!binCode) return Promise.reject(new Error("Rak belum dipilih."));
      return pickItem.mutateAsync({
        picklistId: id,
        itemId,
        qtyPicked: qty,
        binCode,
      });
    },
    [pickItem, id],
  );
  const { bump: bumpPick } = useQtyBumpQueue(commitPick, {
    onGiveUp: (itemId) => {
      const item = itemsRef.current.find((i) => i.id === itemId);
      playScanFeedback("error");
      toast.error(
        `Gagal menyimpan hasil scan ${item?.sku ?? ""} — scan ulang barang ini.`,
      );
    },
  });

  const totalOrdered = items.reduce((s, i) => s + i.qtyOrdered, 0);
  const totalPicked = items.reduce((s, i) => s + i.qtyPicked, 0);
  const failedCount = items.filter((i) => isFailedStatus(i.itemStatus)).length;
  const completedCount = items.filter(
    (i) => i.qtyPicked >= i.qtyOrdered && !isFailedStatus(i.itemStatus),
  ).length;
  const allResolved =
    items.length > 0 &&
    items.every(
      (i) => i.qtyPicked >= i.qtyOrdered || isFailedStatus(i.itemStatus),
    );
  const isTerminal = pl
    ? ["COMPLETED", "FAILED", "CANCELLED"].includes(pl.status)
    : false;
  const editable = !!pl && !isTerminal;

  React.useEffect(() => {
    if (pl && pl.status === "COMPLETED") {
      toast.info(`Picklist ${pl.picklistNo} sudah selesai.`);
      router.replace(LIST_HREF);
    }
  }, [pl, router]);

  const didAutoStart = React.useRef(false);
  React.useEffect(() => {
    if (!pl || didAutoStart.current) return;
    if (pl.status === "DRAFT") {
      didAutoStart.current = true;
      startPicklist.mutate(id, {
        onSuccess: () =>
          toast.success(`Picking dimulai untuk ${pl.picklistNo}.`),
        onError: (e) => toast.error(errMsg(e, "Gagal memulai picking.")),
      });
    }
  }, [pl, id, startPicklist]);

  const [completeDialogDismissed, setCompleteDialogDismissed] =
    React.useState(false);
  const completeDialogOpen =
    !!pl && editable && allResolved && !completeDialogDismissed;

  const handleCompletePicking = () => {
    completePicklist.mutate(id, {
      onSuccess: () => {
        toast.success("Picking selesai.");
        setCompleteDialogDismissed(true);
        router.push(LIST_HREF);
      },
      onError: (e) =>
        toast.error(errMsg(e, "Gagal menyelesaikan picking.")),
    });
  };

  const activeItem = activeItemId
    ? (items.find((i) => i.id === activeItemId) ?? null)
    : null;

  const handleScanSku = async (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;
    if (!editable) return;
    if (BIN_CODE_PATTERN.test(code)) {
      playScanFeedback("error");
      toast.error(`"${code}" adalah kode rak, bukan SKU produk.`);
      setSkuRefocusKey((k) => k + 1);
      return;
    }
    if (scannedBinCode && code === scannedBinCode) {
      playScanFeedback("error");
      toast.error(`"${code}" adalah kode rak aktif, bukan SKU produk.`);
      setSkuRefocusKey((k) => k + 1);
      return;
    }

    try {
      const res = await scanForPick.mutateAsync({
        picklistId: id,
        sku: code,
        binCode: null,
        hintActiveBinCode: scannedBinCode,
      });
      setScannedBinCode(res.bin_code);

      // Multiple candidate racks → let the checker pick the rack (dialog).
      if ((res.candidates?.length ?? 0) > 1) {
        playScanFeedback("ok");
        setActiveItemId(res.item_id);
        setActivePickMax(res.max_pickable);
        setPickQty(String(res.max_pickable));
        setActiveCandidates(res.candidates ?? []);
        setActiveChosenBinCode(res.bin_code);
        toast.info(
          `SKU ada di ${res.candidates.length} rak. Default ambil dari ${res.bin_code}. Ganti kalau perlu.`,
        );
        setTimeout(() => qtyInputRef.current?.focus(), 50);
        return;
      }

      // Single rack → scan-to-increment (+1), stay on the scan bar.
      const item = itemsRef.current.find((i) => i.id === res.item_id);
      const base = item?.qtyPicked ?? 0;
      const max = item?.qtyOrdered ?? base + 1;
      if (base >= max) {
        playScanFeedback("error");
        toast.info(`${item?.sku ?? code} sudah lengkap.`);
        setSkuRefocusKey((k) => k + 1);
        return;
      }
      pickBinRef.current.set(res.item_id, res.bin_code);
      playScanFeedback("ok");
      bumpPick({ itemId: res.item_id, base, max, delta: 1 });
      setSkuRefocusKey((k) => k + 1);
    } catch (e) {
      playScanFeedback("error");
      toast.error(errMsg(e, `SKU "${code}" tidak bisa diambil.`));
      setSkuRefocusKey((k) => k + 1);
    }
  };

  const handleConfirmPick = () => {
    const binCodeForCommit = activeChosenBinCode ?? scannedBinCode;
    if (!activeItem || !binCodeForCommit) return;
    const qty = Number.parseInt(pickQty, 10);
    if (Number.isNaN(qty) || qty <= 0) {
      playScanFeedback("error");
      toast.error("Masukkan qty yang valid.");
      return;
    }
    if (qty > activePickMax) {
      playScanFeedback("error");
      toast.error(
        `Qty melebihi maksimum yang bisa diambil (${activePickMax}).`,
      );
      return;
    }
    pickItem.mutate(
      {
        picklistId: id,
        itemId: activeItem.id,
        qtyPicked: activeItem.qtyPicked + qty,
        binCode: binCodeForCommit,
      },
      {
        onSuccess: () => {
          playScanFeedback("ok");
          toast.success(
            `Stok terpotong: ${activeItem.sku} × ${qty} @ ${binCodeForCommit} (${activeItem.qtyPicked + qty}/${activeItem.qtyOrdered}).`,
          );
          setScannedBinCode(binCodeForCommit);
          setActiveItemId(null);
          setPickQty("");
          setActiveCandidates([]);
          setActiveChosenBinCode(null);
          setSkuRefocusKey((k) => k + 1);
        },
        onError: (e) => {
          playScanFeedback("error");
          toast.error(errMsg(e, `Gagal pick ${activeItem.sku}.`));
        },
      },
    );
  };

  const handleCancelPick = () => {
    setActiveItemId(null);
    setPickQty("");
    setActivePickMax(0);
    setActiveCandidates([]);
    setActiveChosenBinCode(null);
    setSkuRefocusKey((k) => k + 1);
  };

  const handleScanBin = () => {
    const code = binScan.trim();
    if (!code) return;
    const isSku = items.some((i) => i.sku.toLowerCase() === code.toLowerCase());
    if (isSku) {
      playScanFeedback("error");
      toast.error(`"${code}" adalah SKU produk, bukan kode rak.`);
      setBinScan("");
      binScanRef.current?.focus();
      return;
    }
    setBinScan("");
    setScannedBinCode(code);
    playScanFeedback("ok");
    toast.success(`Rak ${code} aktif.`);
    setSkuRefocusKey((k) => k + 1);
  };

  const handleComplete = () => {
    completePicklist.mutate(id, {
      onSuccess: () => {
        toast.success("Picking selesai.");
        router.push(LIST_HREF);
      },
      onError: (e) => toast.error(errMsg(e, "Gagal menyelesaikan picking.")),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={pl ? `Picking - ${pl.picklistNo}` : "Proses Picking"}
        backHref={LIST_HREF}
        breadcrumb={[
          { label: "Gudang" },
          { label: "Proses Pesanan", href: LIST_HREF },
          { label: "Picking", href: LIST_HREF },
          { label: "Proses Picking" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={!editable || !allResolved || completePicklist.isPending}
            >
              {completePicklist.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              Selesaikan Picking
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !pl ? (
        <div className="py-24 text-center text-sm text-destructive">
          Gagal memuat picklist.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {}
          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  No Picklist
                </span>
                <StatusBadge domain="picklist" status={pl.status} />
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-foreground">
                {pl.picklistNo}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Lokasi</span>
                <span className="font-medium text-foreground">
                  {pl.locationName ?? "—"}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Picker</span>
                <span className="font-medium text-foreground">
                  {pl.pickerName ?? "—"}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Durasi Picking</span>
                <span className="font-medium tabular-nums text-foreground">
                  <PickingDurationLive
                    startedAt={pl.startedAt}
                    completedAt={pl.completedAt}
                    status={pl.status}
                  />
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {totalPicked} / {totalOrdered}
                </span>
              </div>
              <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all",
                    allResolved && failedCount === 0
                      ? "bg-success"
                      : "bg-primary",
                  )}
                  style={{
                    width: `${
                      totalOrdered > 0
                        ? Math.min(
                            100,
                            Math.round((totalPicked / totalOrdered) * 100),
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              {failedCount > 0 && (
                <div className="mt-1 text-xs text-warning">
                  Gagal: {failedCount}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs text-muted-foreground">
                Kode Rak Aktif
              </div>
              <div className="mt-1 font-mono text-base font-semibold text-foreground">
                {scannedBinCode ?? "—"}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <ScanBarcodeIcon className="size-4 text-muted-foreground" />
                <div className="text-sm font-medium">Ganti Rak (opsional)</div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Scan bila mau memaksa ambil dari rak tertentu. Bila kosong,
                sistem otomatis memilih rak berdasarkan stok.
              </p>
              <div className="mt-3 flex h-20 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                <ScanBarcodeIcon className="size-8 text-muted-foreground/60" />
              </div>
              <Input
                ref={binScanRef}
                value={binScan}
                onChange={(e) => setBinScan(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleScanBin();
                  }
                }}
                placeholder="Scan kode rak…"
                className="mt-3"
                disabled={!editable}
              />
            </div>

          </aside>

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex-1 min-w-[240px]">
                <label className="text-xs text-muted-foreground">
                  Scan SKU / Barcode
                </label>
                <div className="mt-1.5">
                  <ScanAutoflowBar
                    lines={[]}
                    onResolve={() => {}}
                    onUnmatched={handleScanSku}
                    disabled={
                      !editable ||
                      pickItem.isPending ||
                      scanForPick.isPending
                    }
                    autoFocus
                    refocusKey={skuRefocusKey}
                    scanPlaceholder="Scan SKU / barcode barang…"
                    hint={
                      scannedBinCode
                        ? `Rak aktif: ${scannedBinCode}. Scan SKU = ambil +1; multi-rak minta konfirmasi.`
                        : "Scan SKU = ambil +1. Kalau ada beberapa rak, muncul pilihan rak."
                    }
                    sound={false}
                  />
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 pl-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {totalPicked} / {totalOrdered}
                </span>
              </div>
            </div>

            <Dialog
              open={!!activeItem}
              onOpenChange={(open) => {
                if (!open) handleCancelPick();
              }}
            >
              <DialogContent
                className="sm:max-w-md"
                onOpenAutoFocus={(e) => {
                  e.preventDefault();
                  setTimeout(() => qtyInputRef.current?.focus(), 50);
                }}
              >
                {activeItem && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Konfirmasi Pick</DialogTitle>
                      <DialogDescription>
                        Masukkan jumlah yang diambil dari rak{" "}
                        <span className="font-semibold">
                          {activeChosenBinCode ?? scannedBinCode ?? "—"}
                        </span>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-start gap-4 py-2">
                      <ItemImage
                        src={activeItem.imageUrl}
                        alt={activeItem.name ?? activeItem.sku}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground">
                          {activeItem.name ?? activeItem.sku}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {activeItem.sku}
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>Pesanan</span>
                          <span className="font-medium text-foreground">
                            {activeItem.orderNo ?? "—"}
                          </span>
                          <span>Qty dipesan</span>
                          <span className="font-medium text-foreground">
                            {activeItem.qtyOrdered}
                          </span>
                          <span>Sudah pick</span>
                          <span className="font-medium text-foreground">
                            {activeItem.qtyPicked}
                          </span>
                          <span>Sisa</span>
                          <span className="font-semibold text-primary">
                            {activeItem.qtyOrdered - activeItem.qtyPicked}
                          </span>
                        </div>
                        {activeItem.orderId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              const orderId = activeItem.orderId;
                              if (!orderId) return;
                              setDeleteOrderTarget({
                                orderId,
                                orderNo: activeItem.orderNo,
                              });
                              handleCancelPick();
                            }}
                          >
                            <Trash2Icon className="size-3.5" />
                            Hapus Pesanan
                          </Button>
                        )}
                      </div>
                    </div>
                    {activeCandidates.length > 1 && (
                      <div className="flex items-center gap-3 pt-2">
                        <label className="shrink-0 text-sm font-medium text-foreground">
                          Ambil dari rak
                        </label>
                        <Select
                          value={activeChosenBinCode ?? ""}
                          onValueChange={(v) => {
                            setActiveChosenBinCode(v);
                            const picked = activeCandidates.find(
                              (c) => c.bin_code === v,
                            );
                            if (picked) {
                              const nextMax = Math.min(
                                picked.on_hand,
                                activeItem.qtyOrdered - activeItem.qtyPicked,
                              );
                              setActivePickMax(nextMax);
                              setPickQty(String(nextMax));
                            }
                          }}
                          disabled={pickItem.isPending}
                        >
                          <SelectTrigger className="h-10 flex-1">
                            <SelectValue placeholder="Pilih rak" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeCandidates.map((c) => (
                              <SelectItem key={c.bin_id} value={c.bin_code}>
                                {c.bin_code} · tersedia {c.on_hand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-2">
                      <label className="shrink-0 text-sm font-medium text-foreground">
                        Qty ambil
                      </label>
                      <QtyConfirmInput
                        inputRef={qtyInputRef}
                        min={1}
                        max={activePickMax}
                        expected={activePickMax}
                        value={pickQty === "" ? "" : Number(pickQty)}
                        onChange={(v) =>
                          setPickQty(v === "" ? "" : String(v))
                        }
                        onEnter={handleConfirmPick}
                        placeholder={`maks ${activePickMax}`}
                        className="h-10"
                        disabled={pickItem.isPending}
                      />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button
                        variant="ghost"
                        onClick={handleCancelPick}
                        disabled={pickItem.isPending}
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={handleConfirmPick}
                        disabled={pickItem.isPending || !pickQty.trim()}
                      >
                        {pickItem.isPending && (
                          <Loader2Icon className="size-4 animate-spin" />
                        )}
                        Konfirmasi Pick
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

            <Table
              containerClassName="rounded-lg border border-border bg-card"
              className="min-w-[1100px] border-collapse"
            >
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                  <TableHead className="w-[320px] max-w-[320px] px-3 py-3 text-muted-foreground">
                    Produk
                  </TableHead>
                  <TableHead className="px-3 py-3 text-muted-foreground">
                    Qty Pesan
                  </TableHead>
                  <TableHead className="px-3 py-3 text-muted-foreground">
                    Kode Rak
                  </TableHead>
                  <TableHead className="px-3 py-3 text-muted-foreground">
                    Qty Ambil / Pesan
                  </TableHead>
                  <TableHead className="px-3 py-3 text-muted-foreground">
                    No. Pesanan
                  </TableHead>
                  <TableHead className="px-3 py-3 text-muted-foreground">
                    No. Paket
                  </TableHead>
                  <TableHead className="px-3 py-3 text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="px-3 py-3 text-muted-foreground">
                    No. Resi
                  </TableHead>
                  <TableHead className="w-[120px] px-3 py-3 text-right text-muted-foreground">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada item dalam picklist ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((it) => {
                    const done = it.qtyPicked >= it.qtyOrdered;
                    const itemStatus = getItemStatus(
                      it.qtyPicked,
                      it.qtyOrdered,
                      it.itemStatus,
                    );
                    return (
                      <TableRow
                        key={it.id}
                        className={cn(
                          "border-b border-border/60 last:border-0",
                          done && "bg-success/[0.04]",
                          activeItemId === it.id &&
                            "bg-primary/[0.06] ring-1 ring-inset ring-primary/20",
                        )}
                      >
                        <TableCell className="w-[320px] max-w-[320px] px-3 py-3 align-top">
                          <div className="flex items-start gap-3">
                            <ItemImage
                              src={it.imageUrl}
                              alt={it.name ?? it.sku}
                            />
                            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <span className="whitespace-normal break-words font-medium text-foreground">
                                {it.name ?? it.sku}
                              </span>
                              <span className="whitespace-normal break-all font-mono text-xs text-foreground/70">
                                {it.sku}
                              </span>
                              {it.variantName && (
                                <span className="whitespace-normal break-words text-xs text-muted-foreground">
                                  {it.variantName}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 tabular-nums text-foreground">
                          {it.qtyOrdered}
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <span className="font-mono text-xs text-foreground">
                            {it.binCode ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <span
                            className={cn(
                              "inline-flex h-6 min-w-10 items-center justify-center rounded-xl px-2 text-xs font-medium tabular-nums",
                              done
                                ? "bg-success/10 text-success"
                                : it.qtyPicked > 0
                                  ? "bg-warning/10 text-warning"
                                  : "text-muted-foreground",
                            )}
                          >
                            {it.qtyPicked} / {it.qtyOrdered}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-3 font-mono text-xs text-foreground">
                          {it.orderNo ?? "—"}
                        </TableCell>
                        <TableCell className="px-3 py-3 font-mono text-xs text-foreground">
                          {it.packageNo ?? "—"}
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <StatusBadge domain="picking-item" status={itemStatus} />
                        </TableCell>
                        <TableCell className="px-3 py-3 font-mono text-xs text-foreground">
                          {it.trackingNumber ?? "—"}
                        </TableCell>
                        <TableCell className="w-[120px] px-3 py-3 text-right">
                          {editable ? (
                            <div className="flex items-center justify-end gap-1">
                              {isFailedStatus(it.itemStatus) ? (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Batalkan tanda gagal"
                                  title="Batalkan tanda gagal"
                                  disabled={unfailPickItem.isPending}
                                  onClick={() =>
                                    unfailPickItem.mutate(
                                      { picklistId: id, itemId: it.id },
                                      {
                                        onError: (e) =>
                                          toast.error(
                                            errMsg(
                                              e,
                                              "Gagal membatalkan tanda gagal.",
                                            ),
                                          ),
                                      },
                                    )
                                  }
                                >
                                  {unfailPickItem.isPending ? (
                                    <Loader2Icon className="size-4 animate-spin" />
                                  ) : (
                                    <RotateCcwIcon className="size-4" />
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Tandai gagal"
                                  title={
                                    done
                                      ? "Item sudah selesai"
                                      : "Tandai item gagal"
                                  }
                                  disabled={done}
                                  onClick={() => setFailItemTarget(it)}
                                >
                                  <Trash2Icon className="size-4 text-destructive" />
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label="Pecah rak"
                                title={
                                  done
                                    ? "Item sudah selesai"
                                    : isFailedStatus(it.itemStatus)
                                      ? "Item sudah ditandai gagal"
                                      : "Pecah pengambilan ke beberapa rak"
                                }
                                disabled={done || isFailedStatus(it.itemStatus)}
                                onClick={() => setPecahRakTarget(it)}
                              >
                                <SplitIcon className="size-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </section>
        </div>
      )}

      <Dialog
        open={completeDialogOpen}
        onOpenChange={(open) => {
          if (!open && !completePicklist.isPending) {
            setCompleteDialogDismissed(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selesaikan Picking?</DialogTitle>
            <DialogDescription>
              Ringkasan picklist {pl?.picklistNo ?? ""}:
              <br />• Item selesai:{" "}
              <span className="font-semibold">{completedCount}</span>
              <br />• Item gagal (Kurang / Ditolak):{" "}
              <span className="font-semibold">{failedCount}</span>
              {failedCount > 0 && (
                <>
                  <br />
                  <span className="text-xs">
                    Item gagal tidak ikut ke packing dan akan dikembalikan ke
                    daftar order untuk penanganan lanjut.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setCompleteDialogDismissed(true)}
              disabled={completePicklist.isPending}
            >
              Nanti Saja
            </Button>
            <Button
              onClick={handleCompletePicking}
              disabled={completePicklist.isPending}
            >
              {completePicklist.isPending && (
                <Loader2Icon className="size-4 animate-spin" />
              )}
              Selesaikan Picking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {failItemTarget && (
        <FailItemDialog
          open={!!failItemTarget}
          onOpenChange={(open) => {
            if (!open) setFailItemTarget(null);
          }}
          picklistId={id}
          item={failItemTarget}
        />
      )}

      {pecahRakTarget && (
        <PecahRakDialog
          open={!!pecahRakTarget}
          onOpenChange={(open) => {
            if (!open) setPecahRakTarget(null);
          }}
          picklistId={id}
          item={pecahRakTarget}
        />
      )}

      <DeleteOrderDialog
        open={!!deleteOrderTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteOrderTarget(null);
        }}
        orderId={deleteOrderTarget?.orderId ?? null}
        orderNo={deleteOrderTarget?.orderNo ?? null}
      />
    </div>
  );
}
