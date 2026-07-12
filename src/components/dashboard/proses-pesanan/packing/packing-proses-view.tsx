"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  Loader2Icon,
  PackageIcon,
  RotateCcwIcon,
  ScanBarcodeIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
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
  ScanAutoflowBar,
  type ScanAutoflowLine,
} from "@/components/dashboard/shared/scan-autoflow-bar";
import {
  useCompletePacklist,
  usePackItem,
  usePacklistDetails,
  usePickers,
  useScanOrder,
  useVerifyBarcode,
} from "@/hooks/proses-pesanan/use-fulfillment";
import { useQtyBumpQueue } from "@/hooks/proses-pesanan/use-qty-bump-queue";
import type {
  PacklistDetail,
  PacklistItem,
} from "@/types/proses-pesanan/fulfillment";
import { playScanFeedback } from "@/lib/scan-feedback";
import { usePrintWithDriverCall } from "@/hooks/proses-pesanan/use-driver-call";
import { isShopeeInstantOrSameDay } from "@/lib/proses-pesanan/shopee";
import { apiError } from "@/lib/toast";

const LIST_HREF = "/dashboard/proses-pesanan/packing";

function ItemImage({
  src,
  alt,
  size = 48,
}: {
  src: string | null;
  alt: string;
  size?: number;
}) {
  const [errored, setErrored] = React.useState(false);
  if (!src || errored) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
        style={{ width: size, height: size }}
      >
        <PackageIcon className="size-5" />
      </div>
    );
  }
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

function ProgressBar({ packed, total }: { packed: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((packed / total) * 100)) : 0;
  const done = packed >= total && total > 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {packed} / {total}
        </span>
        <span className="text-xs text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            done ? "bg-success" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function OrderPackCard({
  pl,
  onRemove,
}: {
  pl: PacklistDetail;
  onRemove: (id: string) => void;
}) {
  const packed = pl.items.reduce((s, i) => s + i.qtyPacked, 0);
  const total = pl.items.reduce((s, i) => s + i.qtyOrdered, 0);
  const done = pl.items.length > 0 && pl.items.every((i) => i.qtyPacked >= i.qtyOrdered);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card",
        done ? "border-success/40" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-border/60 bg-muted/30 px-4 py-3 text-sm">
        <div>
          <span className="text-xs text-muted-foreground">Pesanan</span>
          <div className="font-medium">{pl.orderNo ?? "—"}</div>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">No. Packing</span>
          <div className="font-mono text-xs font-semibold">{pl.packlistNo}</div>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Customer</span>
          <div className="font-medium">{pl.customerName ?? "—"}</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {done ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
              <CheckCircle2Icon className="size-3.5" /> Selesai
            </span>
          ) : (
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {packed} / {total}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            aria-label="Keluarkan pesanan dari sesi"
            title="Keluarkan dari sesi packing (tidak menghapus packlist)"
            onClick={() => onRemove(pl.id)}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>

      <Table className="border-collapse">
        <TableHeader>
          <TableRow className="border-b border-border/60 bg-muted/20 text-left text-muted-foreground">
            <TableHead className="px-4 py-2.5 text-muted-foreground">
              Produk
            </TableHead>
            <TableHead className="px-4 py-2.5 text-center text-muted-foreground">
              QTY Pesanan
            </TableHead>
            <TableHead className="px-4 py-2.5 text-center text-muted-foreground">
              QTY Pack
            </TableHead>
            <TableHead className="px-4 py-2.5 text-center text-muted-foreground">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pl.items.map((item) => {
            const itemDone = item.qtyPacked >= item.qtyOrdered;
            return (
              <TableRow
                key={item.id}
                className={cn(
                  "border-b border-border/60 last:border-0 transition-colors",
                  itemDone && "bg-success/[0.04]",
                )}
              >
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ItemImage
                      src={item.imageUrl}
                      alt={item.description ?? item.sku}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {item.description ?? item.sku}
                      </p>
                      <p className="font-mono text-2xs text-muted-foreground">
                        {item.sku}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-center font-medium tabular-nums text-foreground">
                  {item.qtyOrdered}
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <span className="tabular-nums font-semibold">
                    {item.qtyPacked}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  {itemDone ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                      <CheckCircle2Icon className="size-3.5" /> Selesai
                    </span>
                  ) : item.qtyPacked > 0 ? (
                    <span className="text-xs font-medium text-warning">
                      Sisa {item.qtyOrdered - item.qtyPacked}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Belum</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function PackingProsesView() {
  const router = useRouter();

  const checkerInputRef = React.useRef<HTMLInputElement>(null);
  const orderScanRef = React.useRef<HTMLInputElement>(null);

  const [stage, setStage] = React.useState<"checker" | "packing">("checker");
  const [checkerId, setCheckerId] = React.useState<string | null>(null);
  const [checkerQuery, setCheckerQuery] = React.useState("");
  const [orderScan, setOrderScan] = React.useState("");
  const [packlistIds, setPacklistIds] = React.useState<string[]>([]);
  const [scanFocusKey, setScanFocusKey] = React.useState(0);
  const refocusScan = () => setScanFocusKey((k) => k + 1);

  const pickers = usePickers(undefined, "packer");
  const scanOrder = useScanOrder();
  const packItem = usePackItem();
  const verifyBarcode = useVerifyBarcode();
  const completePacklist = useCompletePacklist();

  const detailQueries = usePacklistDetails(packlistIds);
  const packlists = React.useMemo(
    () =>
      detailQueries
        .map((q) => q.data)
        .filter((d): d is PacklistDetail => !!d),
    [detailQueries],
  );
  const anyDetailLoading = detailQueries.some((q) => q.isLoading);

  // itemId -> packlistId, kept in a ref so the commit closure stays stable.
  const itemIndexRef = React.useRef<Map<string, string>>(new Map());
  React.useEffect(() => {
    const m = new Map<string, string>();
    packlists.forEach((pl) => pl.items.forEach((it) => m.set(it.id, pl.id)));
    itemIndexRef.current = m;
  }, [packlists]);

  const packlistIdsRef = React.useRef<string[]>([]);
  React.useEffect(() => {
    packlistIdsRef.current = packlistIds;
  }, [packlistIds]);

  const commitPack = React.useCallback(
    (itemId: string, qty: number) => {
      const plId = itemIndexRef.current.get(itemId);
      if (!plId) return Promise.reject(new Error("Packlist tidak ditemukan."));
      return packItem.mutateAsync({
        packlistId: plId,
        itemId,
        qtyPacked: qty,
        barcodeVerified: true,
      });
    },
    [packItem],
  );
  const { bump, reset } = useQtyBumpQueue(commitPack, {
    onGiveUp: (itemId) => {
      const item = packlists
        .flatMap((pl) => pl.items)
        .find((i) => i.id === itemId);
      playScanFeedback("error");
      toast.error(
        `Gagal menyimpan hasil scan ${item?.sku ?? ""} — scan ulang barang ini.`,
      );
    },
  });

  const totalOrdered = packlists.reduce(
    (s, pl) => s + pl.items.reduce((a, i) => a + i.qtyOrdered, 0),
    0,
  );
  const totalPacked = packlists.reduce(
    (s, pl) => s + pl.items.reduce((a, i) => a + i.qtyPacked, 0),
    0,
  );
  const allItems = packlists.flatMap((pl) => pl.items);

  // FIFO across orders: scanLines follow packlist scan order, so the scan bar
  // resolves the earliest not-done match first when a SKU spans orders.
  const scanLines: ScanAutoflowLine[] = packlists.flatMap((pl) =>
    pl.items.map((it) => ({
      id: it.id,
      primary: it.description ?? it.sku,
      secondary: `${it.sku} · ${pl.orderNo ?? pl.packlistNo}`,
      codes: [it.sku],
      done: it.qtyPacked >= it.qtyOrdered,
    })),
  );

  // Auto-complete each packlist independently as its items fill up.
  const printWithDriverCall = usePrintWithDriverCall();

  const completedRef = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
    packlists.forEach((pl) => {
      const full =
        pl.items.length > 0 &&
        pl.items.every((i) => i.qtyPacked >= i.qtyOrdered);
      if (full && pl.status !== "COMPLETED" && !completedRef.current.has(pl.id)) {
        completedRef.current.add(pl.id);
        completePacklist.mutate(pl.id, {
          onSuccess: () => {
            toast.success(`Packing ${pl.packlistNo} selesai.`);
            if (
              pl.orderId &&
              isShopeeInstantOrSameDay({
                shippingProvider: pl.shippingProvider,
                shippingType: pl.shippingType,
                isInstant: pl.isInstant,
              })
            ) {
              printWithDriverCall.mutate(
                { orderId: pl.orderId },
                {
                  onSuccess: (res) => {
                    if (res.driver_call_status === "success") {
                      toast.success("Driver Shopee berhasil dipanggil.");
                    } else if (res.driver_call_status === "failed") {
                      toast.warning(
                        `Panggilan driver Shopee gagal: ${res.driver_call_message ?? "Coba lagi nanti."}`,
                      );
                    }
                  },
                  onError: () =>
                    toast.warning("Gagal memanggil driver Shopee otomatis."),
                },
              );
            }
          },
          onError: (e) => {
            completedRef.current.delete(pl.id);
            apiError(e, "Gagal menyelesaikan packing.");
          },
        });
      }
    });
  }, [packlists, completePacklist, printWithDriverCall]);

  const pickerList = React.useMemo(() => pickers.data ?? [], [pickers.data]);
  const checkerName =
    pickerList.find((p) => p.id === checkerId)?.name ?? null;

  const checkerMatches = React.useMemo(() => {
    const q = checkerQuery.trim().toLowerCase();
    if (!q) return [];
    return pickerList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q),
    );
  }, [checkerQuery, pickerList]);

  const selectChecker = (id: string) => {
    setCheckerId(id);
    setStage("packing");
    setCheckerQuery("");
    playScanFeedback("ok");
    setTimeout(() => orderScanRef.current?.focus(), 80);
  };

  const resolveChecker = () => {
    const q = checkerQuery.trim();
    if (!q) return;
    if (checkerMatches.length === 1) {
      selectChecker(checkerMatches[0].id);
      return;
    }
    const exact = checkerMatches.find(
      (p) => p.name.toLowerCase() === q.toLowerCase(),
    );
    if (exact) {
      selectChecker(exact.id);
      return;
    }
    if (checkerMatches.length === 0) {
      playScanFeedback("error");
      toast.error(`Checker "${q}" tidak ditemukan.`);
      return;
    }
    toast.info("Beberapa checker cocok — pilih dari daftar.");
  };

  const changeChecker = () => {
    setStage("checker");
    setTimeout(() => checkerInputRef.current?.focus(), 60);
  };

  const handleScanOrder = async () => {
    const code = orderScan.trim();
    if (!code) return;
    if (!checkerId) {
      playScanFeedback("error");
      toast.warning("Pilih checker terlebih dahulu.");
      return;
    }
    setOrderScan("");
    try {
      const result = await scanOrder.mutateAsync({
        orderNo: code,
        packerId: checkerId,
      });
      const already = packlistIdsRef.current.includes(result.id);
      if (already) {
        playScanFeedback("error");
        toast.info(`Pesanan ${result.packlistNo} sudah ada di sesi.`);
      } else {
        setPacklistIds((prev) =>
          prev.includes(result.id) ? prev : [...prev, result.id],
        );
        completedRef.current.delete(result.id);
        playScanFeedback("ok");
        toast.success(`Pesanan ${result.packlistNo} ditambahkan.`);
      }
      refocusScan();
    } catch (err) {
      playScanFeedback("error");
      apiError(
        err,
        `Pesanan "${code}" tidak ditemukan atau belum siap packing.`,
      );
      orderScanRef.current?.focus();
    }
  };

  const increment = (item: PacklistItem) => {
    const remaining = item.qtyOrdered - item.qtyPacked;
    if (remaining <= 0) {
      playScanFeedback("error");
      toast.info(`${item.sku} sudah lengkap.`);
      return;
    }
    bump({
      itemId: item.id,
      base: item.qtyPacked,
      max: item.qtyOrdered,
      delta: 1,
    });
  };

  const handleResolve = (line: ScanAutoflowLine) => {
    const item = allItems.find((i) => i.id === line.id);
    if (item) increment(item);
  };

  const handleUnmatched = async (code: string) => {
    for (const pl of packlists) {
      try {
        const res = await verifyBarcode.mutateAsync({
          packlistId: pl.id,
          barcode: code,
        });
        if (res) {
          const item = pl.items.find((i) => i.id === res.itemId);
          if (item) {
            if (item.qtyPacked >= item.qtyOrdered) {
              playScanFeedback("error");
              toast.info(`${item.sku} sudah lengkap.`);
            } else {
              playScanFeedback("ok");
              increment(item);
            }
            refocusScan();
            return;
          }
        }
      } catch {
        // barcode not in this packlist — try the next one
      }
    }
    playScanFeedback("error");
    toast.error(`SKU/Barcode "${code}" tidak ditemukan di sesi ini.`);
    refocusScan();
  };

  const removeFromSession = (plId: string) => {
    setPacklistIds((prev) => prev.filter((x) => x !== plId));
    completedRef.current.delete(plId);
  };

  const resetSession = () => {
    setPacklistIds([]);
    reset();
    completedRef.current.clear();
    setTimeout(() => orderScanRef.current?.focus(), 60);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Proses Packing"
        breadcrumb={[
          { label: "Gudang" },
          { label: "Proses Pesanan", href: LIST_HREF },
          { label: "Packing" },
          { label: "Proses Packing" },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.push(LIST_HREF)}>
            <ArrowLeftIcon /> Kembali
          </Button>
        }
      />

      {stage === "checker" ? (
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <UserIcon className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Siapa checker-nya?</p>
              <p className="text-xs text-muted-foreground">
                Scan badge atau ketik username checker, lalu Enter.
              </p>
            </div>
          </div>

          <div className="relative">
            <ScanBarcodeIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={checkerInputRef}
              autoFocus
              value={checkerQuery}
              onChange={(e) => setCheckerQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  resolveChecker();
                }
              }}
              placeholder="Scan badge / ketik username checker…"
              className="h-11 pl-9"
              disabled={pickers.isLoading}
            />
          </div>

          {checkerQuery.trim() && (
            <div className="flex flex-col gap-1">
              {checkerMatches.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">
                  Tidak ada checker cocok.
                </p>
              ) : (
                checkerMatches.slice(0, 6).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectChecker(p.id)}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
                  >
                    <span className="font-medium">{p.name}</span>
                    {p.email && (
                      <span className="text-xs text-muted-foreground">
                        {p.email}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            atau pilih manual
            <span className="h-px flex-1 bg-border" />
          </div>

          <Combobox
            options={pickerList.map((p) => ({
              value: p.id,
              label: p.name,
              hint: p.email ?? undefined,
            }))}
            value={checkerId}
            onChange={(v) => v && selectChecker(v)}
            placeholder="Pilih checker…"
            searchPlaceholder="Cari checker…"
            emptyText="Checker tidak ditemukan."
            disabled={pickers.isLoading}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-4">
            {/* Checker + scan controls */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Checker:</span>
                  <span className="font-medium">{checkerName ?? "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {packlistIds.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={resetSession}
                    >
                      <RotateCcwIcon className="size-3.5" /> Sesi Baru
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={changeChecker}
                  >
                    Ganti Checker
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Scan No. Pesanan / Resi{" "}
                    <span className="text-muted-foreground/70">
                      (bisa lebih dari satu)
                    </span>
                  </label>
                  <div className="relative mt-1.5">
                    <ScanBarcodeIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={orderScanRef}
                      value={orderScan}
                      onChange={(e) => setOrderScan(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleScanOrder();
                        }
                      }}
                      placeholder="Scan atau ketik no. pesanan…"
                      className="h-11 pl-9"
                      disabled={scanOrder.isPending}
                    />
                  </div>
                </div>

                {packlistIds.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Scan SKU / Barcode Produk
                    </label>
                    <div className="mt-1.5">
                      <ScanAutoflowBar
                        lines={scanLines}
                        onResolve={handleResolve}
                        onUnmatched={handleUnmatched}
                        refocusKey={scanFocusKey}
                        scanPlaceholder="Scan SKU → qty +1…"
                        hint="Scan SKU = +1 tiap scan. Bulk: ketik qty di kolom QTY Pack lalu Enter."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order cards */}
            {packlistIds.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 py-20">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted/60">
                  <ScanBarcodeIcon className="size-8 text-muted-foreground/60" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-sm font-semibold">Siap untuk packing</p>
                  <p className="text-xs text-muted-foreground">
                    Scan no. pesanan atau resi untuk memulai. Bisa scan beberapa
                    pesanan sekaligus dalam satu sesi.
                  </p>
                </div>
              </div>
            ) : anyDetailLoading && packlists.length === 0 ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-16">
                <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Memuat item…</span>
              </div>
            ) : (
              packlists.map((pl) => (
                <OrderPackCard
                  key={pl.id}
                  pl={pl}
                  onRemove={removeFromSession}
                />
              ))
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Progress sesi ({packlists.length} pesanan)
              </p>
              <ProgressBar packed={totalPacked} total={totalOrdered} />
            </div>

            {allItems.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">
                  Produk dalam sesi
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {allItems.map((item) => {
                    const done = item.qtyPacked >= item.qtyOrdered;
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "relative overflow-hidden rounded-xl border-2 transition-colors",
                          done ? "border-success/40" : "border-border/60",
                        )}
                      >
                        <ItemImage
                          src={item.imageUrl}
                          alt={item.description ?? item.sku}
                          size={96}
                        />
                        {done && (
                          <div className="absolute inset-0 flex items-center justify-center bg-success/20">
                            <CheckCircle2Icon className="size-6 text-success" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                          <p className="truncate text-2xs font-medium text-white">
                            {item.qtyPacked}/{item.qtyOrdered}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
