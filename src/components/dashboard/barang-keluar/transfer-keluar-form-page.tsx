"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2Icon,
  PackageSearchIcon,
  PlusIcon,
  SaveIcon,
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
import {
  ProductPickerDialog,
  type PickedProduct,
} from "@/components/dashboard/transaksi-pembelian/product-picker-dialog";
import { InventoryStockService } from "@/services/persediaan/inventory.service";
import { OutboundTransferService } from "@/services/barang-keluar/outbound-transfer.service";
import { cn } from "@/lib/utils";
import { playScanFeedback } from "@/lib/scan-feedback";

const LIST_HREF = "/dashboard/barang-keluar";

interface LineBin {
  id: string;
  code: string;
  onHand: number;
}

interface LineDraft {
  itemId: string;
  sku: string;
  name: string;
  variantLabel: string;
  thumbnail: string | null;
  binId: string;
  binOnHand: number;
  qty: string;
  notes: string;
  availableBins: LineBin[];
}

interface TransferKeluarFormPageProps {
  mode: "create" | "edit";
  id?: string;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TransferKeluarFormPage({ mode }: TransferKeluarFormPageProps) {
  const router = useRouter();
  const qc = useQueryClient();

  const [transferNo, setTransferNo] = useState("[auto]");
  const [transferDate, setTransferDate] = useState(todayStr);
  const [sourceLocationId, setSourceLocationId] = useState("");
  const [destLocationId, setDestLocationId] = useState("");
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
  const [submitting, setSubmitting] = useState(false);
  const scanRef = useRef<HTMLInputElement>(null);

  const { data: locData } = useLocations({ perPage: 100 });

  const locationOptions = useMemo(
    () =>
      (locData?.items ?? [])
        .filter((l) => {
          const name = (l.locationName ?? "").toLowerCase();
          return !name.includes("transit") && !name.includes("virtual");
        })
        .map((l) => ({ value: l.id, label: l.locationName })),
    [locData],
  );

  const destOptions = useMemo(
    () => locationOptions.filter((o) => o.value !== sourceLocationId),
    [locationOptions, sourceLocationId],
  );

  useEffect(() => {
    if (sourceLocationId) scanRef.current?.focus();
  }, [sourceLocationId]);

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

  const buildLineFromStock = (stock: {
    id: string;
    sku: string;
    product_name: string | null;
    variant_label: string;
    thumbnail_url: string | null;
    primary_bin: { id: string; code: string; on_hand: number } | null;
    available_bins: { id: string; code: string; on_hand: number }[];
  }): LineDraft => {
    const bins: LineBin[] = (stock.available_bins ?? []).map((b) => ({
      id: b.id,
      code: b.code,
      onHand: b.on_hand,
    }));
    const primary = stock.primary_bin
      ? bins.find((b) => b.id === stock.primary_bin!.id)
      : undefined;
    const chosen = primary ?? bins[0];
    return {
      itemId: stock.id,
      sku: stock.sku,
      name: stock.product_name ?? stock.sku,
      variantLabel: stock.variant_label,
      thumbnail: stock.thumbnail_url,
      binId: chosen?.id ?? "",
      binOnHand: chosen?.onHand ?? 0,
      qty: chosen ? "1" : "",
      notes: "",
      availableBins: bins,
    };
  };

  const handleScan = async () => {
    const q = scanCode.trim();
    if (!q || scanning || !sourceLocationId) return;

    setScanning(true);
    try {
      const res = await InventoryStockService.bySku(q, sourceLocationId);
      const stock = res.data;

      if (lines.some((l) => l.itemId === stock.id)) {
        // already present — bump qty of existing row if room, else flash err
        const existing = lines.find((l) => l.itemId === stock.id)!;
        const cur = Number(existing.qty) || 0;
        if (cur < existing.binOnHand) {
          updateLine(existing.itemId, { qty: String(cur + 1) });
          flash("ok");
        } else {
          flash("err");
        }
        return;
      }

      if (!res.data.available_bins || res.data.available_bins.length === 0) {
        toast.warning(`SKU ${stock.sku} tidak punya stok di lokasi asal`);
        flash("err");
        return;
      }

      setLines((prev) => [...prev, buildLineFromStock(stock)]);
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
      setTimeout(() => scanRef.current?.focus(), 100);
    }
  };

  // Manual add via product picker: picker only returns basic product info, so
  // look up stock per SKU at the source location to fill available bins.
  const handlePicked = async (products: PickedProduct[]) => {
    setPickerOpen(false);
    setPickerSearch(undefined);
    const existing = new Set(lines.map((l) => l.itemId));
    const fresh = products.filter((p) => !existing.has(p.itemId));
    if (fresh.length === 0) return;

    const results = await Promise.allSettled(
      fresh.map((p) => InventoryStockService.bySku(p.sku, sourceLocationId)),
    );

    const newLines: LineDraft[] = [];
    let skippedNoStock = 0;
    results.forEach((r, i) => {
      if (r.status !== "fulfilled") return;
      const stock = r.value.data;
      if (!stock.available_bins || stock.available_bins.length === 0) {
        skippedNoStock += 1;
        return;
      }
      if (newLines.some((l) => l.itemId === stock.id)) return;
      newLines.push(buildLineFromStock(stock));
      void i;
    });

    if (newLines.length > 0) {
      setLines((prev) => [...prev, ...newLines]);
    }
    if (skippedNoStock > 0) {
      toast.warning(
        `${skippedNoStock} produk dilewati karena tidak punya stok di lokasi asal`,
      );
    }
    setTimeout(() => scanRef.current?.focus(), 250);
  };

  const validLines = lines.filter((l) => {
    const q = Number(l.qty);
    return (
      !!l.binId &&
      l.qty !== "" &&
      !Number.isNaN(q) &&
      q >= 1 &&
      q <= l.binOnHand
    );
  });

  const canSubmit =
    mode === "create" &&
    !!sourceLocationId &&
    !!destLocationId &&
    sourceLocationId !== destLocationId &&
    !!createdBy.trim() &&
    validLines.length === lines.length &&
    lines.length > 0 &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const manualNo =
        transferNo.trim() === "" || transferNo.trim() === "[auto]"
          ? undefined
          : transferNo.trim();

      const draft = await OutboundTransferService.createDraft({
        source_location_id: sourceLocationId,
        destination_location_id: destLocationId,
        notes: notes.trim() || undefined,
        created_by: createdBy.trim(),
        transfer_number: manualNo,
      });

      const failedSkus: string[] = [];
      for (const l of validLines) {
        try {
          await OutboundTransferService.addItem(draft.id, {
            item_id: l.itemId,
            qty: Number(l.qty),
            source_bin_id: l.binId,
          });
        } catch {
          failedSkus.push(l.sku);
        }
      }

      qc.invalidateQueries({ queryKey: ["outbound-transfer"] });

      if (failedSkus.length > 0) {
        toast.error(
          `Draft dibuat, tapi ${failedSkus.length} item gagal ditambahkan: ${failedSkus.join(", ")}`,
        );
      } else {
        toast.success("Transfer keluar berhasil dibuat");
      }
      router.push(LIST_HREF);
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ||
          "Gagal membuat transfer keluar",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title="Tambah Transfer Keluar"
        backHref={LIST_HREF}
        breadcrumb={[
          { label: "Gudang" },
          { label: "Barang Keluar", href: LIST_HREF },
          { label: "Tambah" },
        ]}
      />

      {/* Header fields */}
      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">No. Transfer</Label>
              <Input
                value={transferNo}
                onChange={(e) => setTransferNo(e.target.value)}
                onFocus={(e) => {
                  if (e.target.value === "[auto]") setTransferNo("");
                }}
                onBlur={(e) => {
                  if (e.target.value.trim() === "") setTransferNo("[auto]");
                }}
                placeholder="[auto]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Tanggal <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Lokasi Asal <span className="text-destructive">*</span>
              </Label>
              <Combobox
                options={locationOptions}
                value={sourceLocationId}
                onChange={(v) => {
                  setSourceLocationId(v ?? "");
                  if (v && v === destLocationId) setDestLocationId("");
                  // stale bins after source change — clear rows
                  setLines([]);
                }}
                placeholder="Pilih lokasi asal…"
                searchPlaceholder="Cari lokasi…"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Lokasi Tujuan <span className="text-destructive">*</span>
              </Label>
              <Combobox
                options={destOptions}
                value={destLocationId}
                onChange={(v) => setDestLocationId(v ?? "")}
                placeholder="Pilih lokasi tujuan…"
                searchPlaceholder="Cari lokasi…"
                emptyText="Pilih lokasi asal dulu"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Keterangan</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan transfer (opsional)"
              rows={3}
            />
          </div>
        </div>
      </LiquidGlass>

      {/* Hidden current-user capture (name string) */}
      <div className="sr-only" aria-hidden="true">
        <UserSelect
          value={createdBy}
          onChange={setCreatedBy}
          defaultToSelf
          placeholder="Petugas"
        />
      </div>

      {/* Items */}
      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="flex flex-col gap-4 px-5 py-5">
          <Label className="text-sm font-medium">
            Item Transfer <span className="text-destructive">*</span>
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
                  sourceLocationId
                    ? "Scan / ketik SKU lalu Enter…"
                    : "Pilih lokasi asal dulu untuk mulai scan…"
                }
                disabled={!sourceLocationId || scanning}
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
              SKU exact match langsung tambah + rak utama auto-terisi. Scan
              ulang untuk menambah qty.
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
                  Qty
                </TableHead>
                <TableHead className="px-3 py-2.5 text-right text-muted-foreground">
                  Qty Transfer
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
                  <TableCell colSpan={6} className="px-3 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <PackageSearchIcon className="size-7 opacity-40" />
                      <p className="text-sm">
                        Belum ada item. Scan SKU atau klik Tambah Baru.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((l) => {
                  const qtyNum =
                    l.qty === "" || Number.isNaN(Number(l.qty))
                      ? 0
                      : Number(l.qty);
                  const noStock = l.binOnHand <= 0;
                  const qtyInvalid =
                    !l.binId || qtyNum < 1 || qtyNum > l.binOnHand;
                  const binOptsForLine = l.availableBins.map((b) => ({
                    value: b.id,
                    label: `${b.code} · ${b.onHand} stok`,
                  }));
                  return (
                    <TableRow key={l.itemId} className="bg-background/50">
                      <TableCell className="px-3 py-2.5">
                        <div className="flex max-w-[260px] items-center gap-3">
                          {l.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
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
                            const onHand = picked?.onHand ?? 0;
                            const cur = Number(l.qty) || 0;
                            updateLine(l.itemId, {
                              binId: v ?? "",
                              binOnHand: onHand,
                              qty:
                                onHand > 0
                                  ? String(Math.min(Math.max(cur, 1), onHand))
                                  : "",
                            });
                          }}
                          placeholder="Pilih rak"
                          searchPlaceholder="Cari rak…"
                          emptyText="Tidak ada rak dengan stok"
                          className="h-9 min-w-[160px]"
                        />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "px-3 py-2.5 text-right font-mono tabular-nums",
                          noStock
                            ? "text-warning"
                            : "text-muted-foreground",
                        )}
                      >
                        {l.binOnHand}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right">
                        <Input
                          type="number"
                          min={1}
                          max={l.binOnHand}
                          value={l.qty}
                          onChange={(e) =>
                            updateLine(l.itemId, { qty: e.target.value })
                          }
                          onBlur={(e) => {
                            const v = Number(e.target.value);
                            if (Number.isNaN(v) || v < 1) {
                              updateLine(l.itemId, {
                                qty: l.binOnHand > 0 ? "1" : "",
                              });
                            } else if (v > l.binOnHand) {
                              updateLine(l.itemId, {
                                qty: String(l.binOnHand),
                              });
                            }
                          }}
                          placeholder="0"
                          className={cn(
                            "h-9 w-20 text-right",
                            qtyInvalid &&
                              "border-destructive ring-1 ring-destructive/30",
                          )}
                        />
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <Input
                          value={l.notes}
                          onChange={(e) =>
                            updateLine(l.itemId, { notes: e.target.value })
                          }
                          placeholder="Catatan (opsional)"
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
              disabled={!sourceLocationId}
              className="gap-1.5"
            >
              <PlusIcon className="size-4" /> Tambah Baru
            </Button>
            {!sourceLocationId && (
              <p className="text-xs text-muted-foreground">
                Pilih lokasi asal dulu untuk menambah item.
              </p>
            )}
          </div>
        </div>
      </LiquidGlass>

      <FormFooter>
        <Button variant="outline" onClick={() => router.push(LIST_HREF)}>
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          ) : (
            <SaveIcon className="mr-2 size-4" />
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
        onPick={handlePicked}
        excludeIds={lines.map((l) => l.itemId)}
        initialSearch={pickerSearch}
      />
    </div>
  );
}
