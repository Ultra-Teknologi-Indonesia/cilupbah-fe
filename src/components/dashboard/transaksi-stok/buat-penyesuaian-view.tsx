"use client";
import Image from "next/image";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2Icon,
  PackageSearchIcon,
  PlusIcon,
  ScanBarcodeIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { PageTitle } from "@/components/dashboard/page-title";
import { FormFooter } from "@/components/dashboard/shared/form-footer";
import { UserSelect } from "@/components/dashboard/shared/user-select";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import { useLocationBinsInfinite } from "@/hooks/manajemen-rak/use-location-bins";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useCreateStockAdjustment } from "@/hooks/transaksi-stok/use-stock-adjustments";
import {
  StockedProductPickerDialog,
  type StockedPickedProduct,
} from "@/components/dashboard/transaksi-stok/stocked-product-picker-dialog";

// eslint-disable-next-line no-restricted-imports
import { InventoryStockService } from "@/services/persediaan/inventory.service";
import { cn } from "@/lib/utils";
import { playScanFeedback } from "@/lib/scan-feedback";

const LIST_HREF = "/dashboard/transaksi-stok?tab=penyesuaian";

interface LineBin {
  id: string;
  code: string;
  onHand: number;
  avgCost: number;
}

interface LineDraft {
  itemId: string;
  sku: string;
  name: string;
  variantLabel: string;
  thumbnail: string | null;
  binId: string;
  binCode: string;
  binOnHand: number;
  binAvgCost: number;
  delta: string;
  unitCost: string;
  notes: string;
  availableBins: LineBin[];
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function AdjustmentBinCombobox({
  locationId,
  availableBins,
  value,
  onChange,
  disabled,
}: {
  locationId: string;
  availableBins: LineBin[];
  value: string;
  onChange: (
    binId: string,
    binCode: string,
    onHand: number,
    avgCost?: number,
  ) => void;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useLocationBinsInfinite(locationId || undefined, {
    search: debouncedSearch.trim() || undefined,
    perPage: 30,
    sort: "bin_final_code",
  });

  const binMapRef = useMemo(
    () => ({
      current: new Map<
        string,
        { code: string; onHand: number; avgCost?: number }
      >(),
    }),
    [],
  );

  const options: ComboboxOption[] = useMemo(() => {
    const opts: ComboboxOption[] = [];
    const addedIds = new Set<string>();

    const term = debouncedSearch.trim().toLowerCase();
    for (const b of availableBins) {
      binMapRef.current.set(b.id, {
        code: b.code,
        onHand: b.onHand,
        avgCost: b.avgCost,
      });
      if (!term || b.code.toLowerCase().includes(term)) {
        opts.push({
          value: b.id,
          label: `${b.code} · ${b.onHand} stok`,
        });
        addedIds.add(b.id);
      }
    }

    const rawItems = data?.pages.flatMap((p) => p.items) ?? [];
    for (const lb of rawItems) {
      if (!binMapRef.current.has(lb.id)) {
        binMapRef.current.set(lb.id, { code: lb.binFinalCode, onHand: 0 });
      }
      if (!addedIds.has(lb.id)) {
        opts.push({
          value: lb.id,
          label: `${lb.binFinalCode} · 0 stok`,
        });
        addedIds.add(lb.id);
      }
    }

    if (
      value &&
      !opts.some((o) => o.value === value) &&
      binMapRef.current.has(value)
    ) {
      const info = binMapRef.current.get(value)!;
      opts.unshift({
        value,
        label: `${info.code} · ${info.onHand} stok`,
      });
    }

    return opts;
  }, [availableBins, data, debouncedSearch, value, binMapRef]);

  return (
    <Combobox
      options={options}
      value={value || null}
      onChange={(v) => {
        if (!v) {
          onChange("", "", 0);
          return;
        }
        const info = binMapRef.current.get(v);
        onChange(v, info?.code ?? "", info?.onHand ?? 0, info?.avgCost);
      }}
      onQueryChange={setSearch}
      loading={isLoading}
      onLoadMore={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      hasMore={hasNextPage}
      loadingMore={isFetchingNextPage}
      placeholder="Scan / pilih rak"
      searchPlaceholder="Scan / cari rak…"
      emptyText={isLoading ? "Mencari rak…" : "Tidak ada rak di lokasi ini"}
      disabled={disabled || !locationId}
      className="h-9 min-w-[160px]"
    />
  );
}

export function BuatPenyesuaianView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locationId, setLocationId] = useState(
    () => searchParams.get("location_id") ?? "",
  );
  const [transactionDate, setTransactionDate] = useState(todayStr);
  const [adjustmentNo, setAdjustmentNo] = useState("[auto]");
  const [notes, setNotes] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState<string | undefined>(
    undefined,
  );
  const [scanCode, setScanCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanFlash, setScanFlash] = useState<"ok" | "err" | null>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  const { data: locData } = useLocations({ perPage: 100 });
  const createMut = useCreateStockAdjustment();

  const locationOptions = useMemo(
    () =>
      (locData?.items ?? []).map((l) => ({ value: l.id, label: l.locationName })),
    [locData],
  );

  useEffect(() => {
    if (locationId) scanRef.current?.focus();
  }, [locationId]);

  const prefillAppliedRef = useRef(false);

  useEffect(() => {
    if (prefillAppliedRef.current) return;
    const itemsParam = searchParams.get("items");
    const locParam = searchParams.get("location_id");
    if (!itemsParam || !locParam) return;
    prefillAppliedRef.current = true;

    let entries: { sku: string; qty: number; binId: string }[] = [];
    try {
      entries = JSON.parse(itemsParam);
    } catch {
      return;
    }
    if (!Array.isArray(entries) || entries.length === 0) return;

    (async () => {
      const results = await Promise.all(
        entries.map((e) =>
          InventoryStockService.bySku(e.sku, locParam).catch(() => null),
        ),
      );

      let addedAny = false;

      setLines((prev) => {
        const existing = new Set(prev.map((l) => l.itemId));
        const fresh: LineDraft[] = [];

        results.forEach((res, i) => {
          const variant = res?.data;
          if (!variant || existing.has(variant.id)) return;
          const entry = entries[i];
          const bin =
            variant.available_bins.find((b) => b.id === entry.binId) ??
            variant.primary_bin ??
            null;

          fresh.push({
            itemId: variant.id,
            sku: variant.sku,
            name: variant.product_name ?? variant.sku,
            variantLabel: variant.variant_label,
            thumbnail: variant.thumbnail_url,
            binId: bin?.id ?? "",
            binCode: bin?.code ?? "",
            binOnHand: bin?.on_hand ?? 0,
            binAvgCost: bin?.avg_cost ?? variant.avg_cost ?? 0,
            delta: String(-entry.qty),
            unitCost: bin?.avg_cost != null ? String(bin.avg_cost) : "",
            notes: "Selisih penempatan (stok fiktif)",
            availableBins: variant.available_bins.map((b) => ({
              id: b.id,
              code: b.code,
              onHand: b.on_hand,
              avgCost: b.avg_cost,
            })),
          });
        });

        addedAny = fresh.length > 0;
        return [...prev, ...fresh];
      });

      if (addedAny) {
        setNotes((prev) => prev || "Selisih penempatan (stok fiktif)");
      }
    })();
  }, [searchParams]);

  const addLinesFromPicker = async (products: StockedPickedProduct[]) => {
    setPickerOpen(false);
    setPickerSearch(undefined);
    if (!locationId) return;

    for (const p of products) {
      if (lines.some((l) => l.itemId === p.itemId)) continue;
      try {
        const res = await InventoryStockService.bySku(p.sku, locationId);
        const variant = res.data;
        setLines((prev) => {
          if (prev.some((l) => l.itemId === variant.id)) return prev;
          const primary =
            variant.primary_bin ??
            variant.available_bins?.[0] ??
            null;
          return [
            ...prev,
            {
              itemId: variant.id,
              sku: variant.sku,
              name: variant.product_name ?? variant.sku,
              variantLabel: variant.variant_label ?? "",
              thumbnail: variant.thumbnail_url ?? null,
              binId: primary?.id ?? "",
              binCode: primary?.code ?? "",
              binOnHand: primary?.on_hand ?? 0,
              binAvgCost: primary?.avg_cost ?? variant.avg_cost ?? 0,
              delta: "",
              unitCost:
                (primary?.avg_cost ?? variant.avg_cost) != null
                  ? String(primary?.avg_cost ?? variant.avg_cost)
                  : "",
              notes: "",
              availableBins: (variant.available_bins ?? []).map((b) => ({
                id: b.id,
                code: b.code,
                onHand: b.on_hand,
                avgCost: b.avg_cost,
              })),
            },
          ];
        });
      } catch {
        setLines((prev) => {
          if (prev.some((l) => l.itemId === p.itemId)) return prev;
          return [
            ...prev,
            {
              itemId: p.itemId,
              sku: p.sku,
              name: p.name,
              variantLabel: p.variantLabel ?? "",
              thumbnail: p.thumbnail ?? null,
              binId: "",
              binCode: "",
              binOnHand: 0,
              binAvgCost: 0,
              delta: "",
              unitCost: "",
              notes: "",
              availableBins: [],
            },
          ];
        });
      }
    }
  };

  const flash = (state: "ok" | "err") => {
    setScanFlash(state);
    playScanFeedback(state === "ok" ? "ok" : "error");
    setTimeout(() => setScanFlash(null), 350);
  };

  const updateLine = (itemId: string, patch: Partial<LineDraft>) =>
    setLines((prev) =>
      prev.map((l) => (l.itemId === itemId ? { ...l, ...patch } : l)),
    );
  const removeLine = (itemId: string) =>
    setLines((prev) => prev.filter((l) => l.itemId !== itemId));

  const handleScan = async () => {
    const q = scanCode.trim();
    if (!q || scanning) return;

    setScanning(true);
    try {
      const res = await InventoryStockService.bySku(q, locationId);
      const variant = res.data;

      if (lines.some((l) => l.itemId === variant.id)) {
        flash("err");
        return;
      }
      setLines((prev) => [
        ...prev,
        {
          itemId: variant.id,
          sku: variant.sku,
          name: variant.product_name ?? variant.sku,
          variantLabel: variant.variant_label,
          thumbnail: variant.thumbnail_url,
          binId: variant.primary_bin?.id ?? "",
          binCode: variant.primary_bin?.code ?? "",
          binOnHand: variant.primary_bin?.on_hand ?? 0,
          binAvgCost: variant.primary_bin?.avg_cost ?? variant.avg_cost ?? 0,
          delta: "",
          unitCost:
            variant.primary_bin?.avg_cost != null
              ? String(variant.primary_bin.avg_cost)
              : variant.avg_cost != null
                ? String(variant.avg_cost)
                : "",
          notes: "",
          availableBins: (variant.available_bins ?? []).map((b) => ({
            id: b.id,
            code: b.code,
            onHand: b.on_hand,
            avgCost: b.avg_cost,
          })),
        },
      ]);
      flash("ok");
    } catch (err) {
      flash("err");
    } finally {
      setScanning(false);
      setScanCode("");
    }
  };

  const validLines = lines.filter((l) => {
    const d = Number(l.delta);
    return l.delta !== "" && !Number.isNaN(d) && d !== 0 && !!l.binId;
  });

  const canSubmit =
    !!locationId &&
    !!transactionDate &&
    lines.length > 0 &&
    validLines.length === lines.length;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createMut.mutate(
      {
        transaction_date: transactionDate,
        location_id: locationId,
        adjustment_no:
          adjustmentNo.trim() === "" || adjustmentNo.trim() === "[auto]"
            ? undefined
            : adjustmentNo.trim(),
        notes: notes.trim() || undefined,
        created_by: createdBy.trim(),
        items: lines.map((l) => ({
          item_id: l.itemId,
          bin_id: l.binId || undefined,
          actual_qty: l.binOnHand + Number(l.delta),
          unit_cost: l.unitCost ? Number(l.unitCost) : undefined,
          notes: l.notes.trim() || undefined,
        })),
      },
      {
        onSuccess: () => router.push(LIST_HREF),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Buat Penyesuaian Stok"
        description="Koreksi jumlah stok riil gudang terhadap data sistem (+ / -)."
      />

      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="flex flex-col gap-4 px-5 py-5">
          <p className="text-sm font-semibold">Informasi Penyesuaian</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                No. Penyesuaian
              </Label>
              <Input
                value={adjustmentNo}
                onChange={(e) => setAdjustmentNo(e.target.value)}
                placeholder="[auto]"
                disabled
                className="h-9 font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Lokasi / Gudang <span className="text-destructive">*</span>
              </Label>
              <Combobox
                options={locationOptions}
                value={locationId}
                onChange={(v) => {
                  setLocationId(v ?? "");
                  setLines([]);
                }}
                placeholder="Pilih lokasi…"
                searchPlaceholder="Cari lokasi…"
                className="h-9"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Tanggal Penyesuaian <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Petugas / Pembuat
              </Label>
              <UserSelect
                value={createdBy}
                onChange={setCreatedBy}
                defaultToSelf
                placeholder="Pilih petugas…"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Catatan / Alasan Penyesuaian
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Stok opname berkala Q1, penyesuaian barang rusak, dsb."
              rows={2}
              className="resize-none text-xs"
            />
          </div>
        </div>
      </LiquidGlass>

      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="flex flex-col gap-4 px-5 py-5">
          <Label className="text-sm font-medium">
            Item Koreksi Stok <span className="text-destructive">*</span>
          </Label>

          <div className="flex flex-col gap-1.5">
            <div className="relative">
              {scanning ? (
                <Loader2Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-primary" />
              ) : (
                <ScanBarcodeIcon
                  className={cn(
                    "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors",
                    scanFlash === "ok"
                      ? "text-success"
                      : scanFlash === "err"
                        ? "text-destructive"
                        : "text-muted-foreground",
                  )}
                />
              )}
              <Input
                ref={scanRef}
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleScan();
                  }
                }}
                placeholder={
                  locationId
                    ? "Scan / ketik SKU lalu Enter…"
                    : "Pilih lokasi dulu untuk mulai scan…"
                }
                disabled={!locationId || scanning}
                className={cn(
                  "h-10 pl-9 text-base transition-colors",
                  scanFlash === "ok" &&
                    "border-success ring-2 ring-success/30",
                  scanFlash === "err" &&
                    "border-destructive ring-2 ring-destructive/30",
                )}
                autoComplete="off"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              SKU exact match langsung tambah + rak utama auto-terisi. Rak bisa
              di-scan lewat kolom Rak.
            </p>
          </div>

          <Table containerClassName="rounded-xl border border-border/60">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="min-w-[200px]">PRODUK</TableHead>
                <TableHead className="min-w-[180px]">KODE RAK</TableHead>
                <TableHead className="w-24 text-right">+/-</TableHead>
                <TableHead className="w-24 text-right">ON HAND</TableHead>
                <TableHead className="w-24 text-right">QTY AKHIR</TableHead>
                <TableHead className="min-w-[180px]">KETERANGAN</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <PackageSearchIcon className="size-7 opacity-40" />
                      <p className="text-sm">
                        Belum ada item. Scan SKU atau klik Tambah Item.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((l) => {
                  const deltaNum =
                    l.delta === "" || Number.isNaN(Number(l.delta))
                      ? 0
                      : Number(l.delta);
                  const qtyAkhir = l.binOnHand + deltaNum;

                  return (
                    <TableRow key={l.itemId} className="bg-background/50">
                      <TableCell className="px-3 py-2.5">
                        <div className="flex max-w-[260px] items-center gap-3">
                          {l.thumbnail ? (
                            <Image
                              unoptimized
                              width={400}
                              height={400}
                              src={l.thumbnail}
                              alt={l.name}
                              className="h-11 w-11 shrink-0 rounded-xl border border-border object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                              <PackageSearchIcon className="size-5 text-muted-foreground/40" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {l.name}
                            </p>
                            {l.variantLabel && (
                              <p className="truncate text-xs text-muted-foreground">
                                {l.variantLabel}
                              </p>
                            )}
                            <p className="truncate font-mono text-2xs text-muted-foreground">
                              {l.sku}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-3 py-2.5">
                        <AdjustmentBinCombobox
                          locationId={locationId}
                          availableBins={l.availableBins}
                          value={l.binId}
                          onChange={(binId, binCode, onHand, avgCost) => {
                            const effectiveAvgCost =
                              avgCost ?? l.binAvgCost ?? 0;
                            updateLine(l.itemId, {
                              binId,
                              binCode,
                              binOnHand: onHand,
                              binAvgCost: effectiveAvgCost,
                              unitCost:
                                effectiveAvgCost != null
                                  ? String(effectiveAvgCost)
                                  : l.unitCost,
                            });
                          }}
                          disabled={!locationId}
                        />
                      </TableCell>

                      <TableCell className="px-3 py-2.5 text-right align-top">
                        <Input
                          type="number"
                          value={l.delta}
                          onChange={(e) =>
                            updateLine(l.itemId, { delta: e.target.value })
                          }
                          placeholder="0"
                          className="h-9 w-20 text-right"
                        />
                      </TableCell>

                      <TableCell className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground align-top">
                        {l.binOnHand}
                      </TableCell>

                      <TableCell className="px-3 py-2.5 text-right font-mono tabular-nums font-semibold align-top">
                        {qtyAkhir}
                      </TableCell>

                      <TableCell className="px-3 py-2.5 align-top">
                        <Input
                          value={l.notes}
                          onChange={(e) =>
                            updateLine(l.itemId, { notes: e.target.value })
                          }
                          placeholder="Alasan"
                          className="h-9 text-xs"
                        />
                      </TableCell>

                      <TableCell className="px-3 py-2.5 text-center align-top">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeLine(l.itemId)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPickerOpen(true)}
              disabled={!locationId}
              className="gap-1.5"
            >
              <PlusIcon className="size-4" /> Tambah Item
            </Button>
          </div>
        </div>
      </LiquidGlass>

      <FormFooter>
        <Button variant="outline" onClick={() => router.push(LIST_HREF)}>
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || createMut.isPending}
        >
          {createMut.isPending && (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          )}
          Simpan
        </Button>
      </FormFooter>

      <StockedProductPickerDialog
        open={pickerOpen}
        onOpenChange={(v) => {
          setPickerOpen(v);
          if (!v) setPickerSearch(undefined);
        }}
        onPick={addLinesFromPicker}
        locationId={locationId}
        includeZero={true}
        excludeIds={lines.map((l) => l.itemId)}
        initialSearch={pickerSearch}
      />
    </div>
  );
}
