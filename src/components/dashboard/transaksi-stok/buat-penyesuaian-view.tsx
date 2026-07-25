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
import { Combobox } from "@/components/ui/combobox";
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
import { useCreateStockAdjustment } from "@/hooks/transaksi-stok/use-stock-adjustments";
import {
  ProductPickerDialog,
  type PickedProduct,
} from "@/components/dashboard/transaksi-pembelian/product-picker-dialog";
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

  const addLines = (
    products: (PickedProduct & {
      binId?: string;
      binCode?: string;
      binOnHand?: number;
      binAvgCost?: number;
      variantLabel?: string;
      thumbnail?: string | null;
      availableBins?: LineBin[];
    })[],
  ) => {
    setLines((prev) => {
      const existing = new Set(prev.map((l) => l.itemId));
      const fresh = products
        .filter((p) => !existing.has(p.itemId))
        .map((p) => ({
          itemId: p.itemId,
          sku: p.sku,
          name: p.name,
          variantLabel: p.variantLabel ?? "",
          thumbnail: p.thumbnail ?? null,
          binId: p.binId ?? "",
          binCode: p.binCode ?? "",
          binOnHand: p.binOnHand ?? 0,
          binAvgCost: p.binAvgCost ?? 0,
          delta: "",
          unitCost: p.binAvgCost != null ? String(p.binAvgCost) : "",
          notes: "",
          availableBins: p.availableBins ?? [],
        }));
      return [...prev, ...fresh];
    });
    setPickerOpen(false);
    setPickerSearch(undefined);
    setTimeout(() => scanRef.current?.focus(), 250);
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
      addLines([
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
          availableBins: (variant.available_bins ?? []).map((b) => ({
            id: b.id,
            code: b.code,
            onHand: b.on_hand,
            avgCost: b.avg_cost,
          })),
          sellPrice: null,
        },
      ]);
      flash("ok");
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 404) {
        setPickerSearch(q);
        setPickerOpen(true);
      } else {
        flash("err");
      }
    } finally {
      setScanning(false);
      setScanCode("");
    }
  };

  const validLines = lines.filter((l) => {
    const d = Number(l.delta);
    return l.delta !== "" && !Number.isNaN(d) && d !== 0;
  });
  const canSubmit =
    !!locationId &&
    !!transactionDate &&
    !!createdBy.trim() &&
    validLines.length > 0;

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
        items: validLines.map((l) => {
          const cost = Number(l.unitCost);
          return {
            item_id: l.itemId,
            bin_id: l.binId || undefined,
            actual_qty: l.binOnHand + Number(l.delta),
            unit_cost: Number.isFinite(cost) && cost > 0 ? cost : undefined,
            notes: l.notes.trim() || undefined,
          };
        }),
      },
      { onSuccess: () => router.push(LIST_HREF) },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title="Buat Koreksi Stok"
        backHref={LIST_HREF}
        breadcrumb={[
          { label: "Persediaan" },
          { label: "Transaksi Stok", href: LIST_HREF },
          { label: "Buat Koreksi Stok" },
        ]}
      />

      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">No. Penyesuaian</Label>
              <Input
                value={adjustmentNo}
                onChange={(e) => setAdjustmentNo(e.target.value)}
                onFocus={(e) => {
                  if (e.target.value === "[auto]") {
                    setAdjustmentNo("");
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value.trim() === "") {
                    setAdjustmentNo("[auto]");
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Tanggal <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Lokasi <span className="text-destructive">*</span>
              </Label>
              <Combobox
                options={locationOptions}
                value={locationId}
                onChange={(v) => {
                  setLocationId(v ?? "");
                  setLines((p) => p.map((l) => ({ ...l, binId: "" })));
                }}
                placeholder="Pilih lokasi…"
                searchPlaceholder="Cari lokasi…"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Keterangan</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alasan koreksi (opsional)"
              rows={3}
            />
          </div>
        </div>
      </LiquidGlass>

      <div className="sr-only" aria-hidden="true">
        <UserSelect
          value={createdBy}
          onChange={setCreatedBy}
          defaultToSelf
          placeholder="Petugas"
        />
      </div>

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

          <Table containerClassName="rounded-lg border border-border">
            <TableHeader className="bg-muted/40 text-xs uppercase tracking-wider">
              <TableRow>
                <TableHead className="px-3 py-2.5 text-muted-foreground">
                  Produk
                </TableHead>
                <TableHead className="px-3 py-2.5 text-muted-foreground">
                  Kode Rak
                </TableHead>
                <TableHead className="px-3 py-2.5 text-right text-muted-foreground">
                  +/-
                </TableHead>
                <TableHead className="px-3 py-2.5 text-right text-muted-foreground">
                  On Hand
                </TableHead>
                <TableHead className="px-3 py-2.5 text-right text-muted-foreground">
                  Qty Akhir
                </TableHead>
                <TableHead className="px-3 py-2.5 text-muted-foreground">
                  Keterangan
                </TableHead>
                <TableHead className="px-3 py-2.5" />
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-3 py-12 text-center">
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
                  const willGoNegative = qtyAkhir < 0;
                  const binOptsForLine = l.availableBins.map((b) => ({
                    value: b.id,
                    label: `${b.code} · ${b.onHand} stok`,
                  }));
                  return (
                    <TableRow key={l.itemId} className="bg-background/50">

                      <TableCell className="px-3 py-2.5">
                        <div className="flex max-w-[260px] items-center gap-3">
                          {l.thumbnail ? (
                            <Image unoptimized width={400} height={400}
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
                        <Combobox
                          options={binOptsForLine}
                          value={l.binId}
                          onChange={(v) => {
                            const picked = l.availableBins.find(
                              (b) => b.id === v,
                            );
                            updateLine(l.itemId, {
                              binId: v ?? "",
                              binCode: picked?.code ?? "",
                              binOnHand: picked?.onHand ?? 0,
                              binAvgCost: picked?.avgCost ?? 0,
                              unitCost:
                                picked?.avgCost != null
                                  ? String(picked.avgCost)
                                  : l.unitCost,
                            });
                          }}
                          placeholder="Scan / pilih rak"
                          searchPlaceholder="Scan / cari rak…"
                          emptyText="Tidak ada rak dengan stok"
                          className="h-9 min-w-[160px]"
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
                          className={cn(
                            "h-9 w-20 text-right",
                            willGoNegative &&
                              "border-amber-500 ring-1 ring-amber-500/40",
                          )}
                        />
                        {willGoNegative && (
                          <p className="text-amber-600 text-xs mt-0.5">
                            Melebihi data sistem (tersedia: {l.binOnHand}) — akan tercatat minus
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground align-top">
                        {l.binOnHand}
                      </TableCell>

                      <TableCell
                        className={cn(
                          "px-3 py-2.5 text-right font-mono font-semibold tabular-nums align-top",
                          willGoNegative ? "text-amber-600" : "text-foreground",
                        )}
                      >
                        {qtyAkhir}
                      </TableCell>

                      <TableCell className="px-3 py-2.5">
                        <Input
                          value={l.notes}
                          onChange={(e) =>
                            updateLine(l.itemId, { notes: e.target.value })
                          }
                          placeholder="Alasan"
                          className="h-9 min-w-[140px]"
                        />
                      </TableCell>

                      <TableCell className="px-3 py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeLine(l.itemId)}
                          aria-label="Hapus"
                          className="text-destructive"
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
              className="gap-1.5"
            >
              <PlusIcon className="size-4" /> Tambah Item
            </Button>
            {lines.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Qty Akhir = On Hand + <span className="font-mono">+/-</span>.
                Selisih dihitung otomatis saat disimpan.
              </p>
            )}
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

      <ProductPickerDialog
        open={pickerOpen}
        onOpenChange={(v) => {
          setPickerOpen(v);
          if (!v) setPickerSearch(undefined);
        }}
        onPick={addLines}
        excludeIds={lines.map((l) => l.itemId)}
        initialSearch={pickerSearch}
      />
    </div>
  );
}
