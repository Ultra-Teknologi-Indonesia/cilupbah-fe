"use client";

import { DetailSkeleton } from "@/components/ui/page-skeleton";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckIcon,
  Loader2Icon,
  PackageIcon,
  ScanBarcodeIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
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
} from "@/hooks/proses-pesanan/use-fulfillment";
import { ScanAutoflowBar } from "@/components/dashboard/shared/scan-autoflow-bar";
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
  if (picked >= ordered && ordered > 0) return "COMPLETED";
  if (picked > 0) return "PARTIAL";
  if (s === "PICKED") return "COMPLETED";
  return "PENDING";
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

  const items = React.useMemo(() => pl?.items ?? [], [pl]);

  const totalOrdered = items.reduce((s, i) => s + i.qtyOrdered, 0);
  const totalPicked = items.reduce((s, i) => s + i.qtyPicked, 0);
  const allPicked =
    items.length > 0 && items.every((i) => i.qtyPicked >= i.qtyOrdered);
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
    !!pl && editable && allPicked && !completeDialogDismissed;

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
      playScanFeedback("ok");
      setScannedBinCode(res.bin_code);
      setActiveItemId(res.item_id);
      setActivePickMax(res.max_pickable);
      setPickQty(String(res.max_pickable));
      setActiveCandidates(res.candidates ?? []);
      setActiveChosenBinCode(res.bin_code);
      if ((res.candidates?.length ?? 0) > 1) {
        toast.info(
          `SKU ada di ${res.candidates.length} rak. Default ambil dari ${res.bin_code}. Ganti kalau perlu.`,
        );
      }
      setTimeout(() => qtyInputRef.current?.focus(), 50);
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
        breadcrumb={[
          { label: "Gudang" },
          { label: "Proses Pesanan", href: LIST_HREF },
          { label: "Picking", href: LIST_HREF },
          { label: "Proses Picking" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(LIST_HREF)}>
              <ArrowLeftIcon /> Kembali
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={!editable || !allPicked || completePicklist.isPending}
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
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {totalPicked} / {totalOrdered}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    allPicked ? "bg-success" : "bg-primary",
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
                        ? `Rak aktif: ${scannedBinCode}. Enter setelah scan SKU.`
                        : "Scan SKU langsung — sistem akan sarankan raknya."
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
                  <TableHead className="px-3 py-3 text-muted-foreground">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
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
                        <TableCell className="px-3 py-3">
                          <div className="flex items-start gap-3">
                            <ItemImage
                              src={it.imageUrl}
                              alt={it.name ?? it.sku}
                            />
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <span className="font-medium text-foreground">
                                {it.name ?? it.sku}
                              </span>
                              <span className="font-mono text-xs text-foreground/70">
                                {it.sku}
                              </span>
                              {it.variantName && (
                                <span className="text-xs text-muted-foreground">
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
                              "inline-flex h-6 min-w-10 items-center justify-center rounded-md px-2 text-xs font-medium tabular-nums",
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
              Semua item pada picklist {pl?.picklistNo ?? ""} sudah di-pick.
              Klik Selesaikan untuk menutup picking dan lanjut ke daftar.
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
    </div>
  );
}
