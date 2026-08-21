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
import { Skeleton } from "@/components/ui/skeleton";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import { useLocationBinsInfinite } from "@/hooks/manajemen-rak/use-location-bins";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useCreateStockAdjustment,
  useUpdateStockAdjustment,
  useStockAdjustmentDetail,
  useStockAdjustmentItems,
} from "@/hooks/transaksi-stok/use-stock-adjustments";
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
  avgCost?: number;
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

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useLocationBinsInfinite(locationId || undefined, {
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

export interface PenyesuaianFormPageProps {
  mode?: "create" | "edit";
  id?: string;
}

export function PenyesuaianFormPage({
  mode = "create",
  id,
}: PenyesuaianFormPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isEdit = mode === "edit" && Boolean(id);

  // Edit queries
  const { data: editDetail, isLoading: isLoadingDetail } =
    useStockAdjustmentDetail(isEdit ? id! : "");
  const { data: editItemsData, isLoading: isLoadingItems } =
    useStockAdjustmentItems(isEdit ? id! : "", { per_page: 500 });

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
  const updateMut = useUpdateStockAdjustment();

  const locationOptions = useMemo(
    () =>
      (locData?.items ?? []).map((l) => ({
        value: l.id,
        label: l.locationName,
      })),
    [locData],
  );

  // Populate data in edit mode
  const editPopulatedRef = useRef(false);
  useEffect(() => {
    if (!isEdit || editPopulatedRef.current) return;
    if (!editDetail || !editItemsData) return;

    editPopulatedRef.current = true;
    setLocationId(editDetail.location_id ?? editDetail.location?.id ?? "");
    setTransactionDate(
      editDetail.transaction_date
        ? editDetail.transaction_date.slice(0, 10)
        : todayStr(),
    );
    setAdjustmentNo(editDetail.adjustment_no ?? "[auto]");
    setNotes(editDetail.notes ?? "");
    setCreatedBy(editDetail.created_by ?? "");

    const loadedLines: LineDraft[] = (editItemsData.items ?? []).map((item) => {
      const prod = item.product;
      const sku = prod?.sku ?? "";
      const name = prod?.product?.name ?? sku ?? "—";
      const imageUrl =
        prod?.media?.[0]?.url || prod?.product?.media?.[0]?.url || null;
      const binId = item.bin_id ?? item.bin?.id ?? "";
      const binCode = item.bin?.bin_final_code ?? "";
      const systemQty = item.system_qty ?? 0;
      const actualQty = item.actual_qty ?? 0;
      const delta = String(actualQty - systemQty);
      const unitCost =
        item.unit_cost != null ? String(item.unit_cost) : "";

      return {
        itemId: item.item_id,
        sku,
        name,
        variantLabel: sku,
        thumbnail: imageUrl,
        binId,
        binCode,
        binOnHand: systemQty,
        binAvgCost: item.unit_cost != null ? Number(item.unit_cost) : 0,
        delta,
        unitCost,
        notes: item.notes ?? "",
        availableBins: binId
          ? [
              {
                id: binId,
                code: binCode,
                onHand: systemQty,
                avgCost: Number(item.unit_cost ?? 0),
              },
            ]
          : [],
      };
    });

    setLines(loadedLines);

    // Asynchronously enhance available bins for loaded lines
    if (editDetail.location_id) {
      loadedLines.forEach(async (l) => {
        if (!l.sku) return;
        try {
          const res = await InventoryStockService.bySku(
            l.sku,
            editDetail.location_id,
          );
          if (res?.data?.available_bins) {
            setLines((prev) =>
              prev.map((line) =>
                line.itemId === l.itemId
                  ? {
                      ...line,
                      availableBins: res.data.available_bins.map((b) => ({
                        id: b.id,
                        code: b.code,
                        onHand: b.on_hand,
                        avgCost: b.avg_cost,
                      })),
                    }
                  : line,
              ),
            );
          }
        } catch {
          // ignore
        }
      });
    }
  }, [isEdit, editDetail, editItemsData]);

  useEffect(() => {
    if (locationId) scanRef.current?.focus();
  }, [locationId]);

  const prefillAppliedRef = useRef(false);

  useEffect(() => {
    if (isEdit || prefillAppliedRef.current) return;
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

        return [...prev, ...fresh];
      });
    })();
  }, [isEdit, searchParams]);

  const addLinesFromPicker = async (picked: StockedPickedProduct[]) => {
    for (const p of picked) {
      if (lines.some((l) => l.itemId === p.itemId)) continue;
      try {
        const res = await InventoryStockService.bySku(p.sku, locationId);
        const variant = res.data;
        const primary = variant.primary_bin ?? variant.available_bins?.[0];

        setLines((prev) => {
          if (prev.some((l) => l.itemId === p.itemId)) return prev;
          return [
            ...prev,
            {
              itemId: variant.id,
              sku: variant.sku,
              name: variant.product_name ?? variant.sku,
              variantLabel: variant.variant_label ?? p.variantLabel ?? "",
              thumbnail: variant.thumbnail_url ?? p.thumbnail ?? null,
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

  const updateLine = (itemId: string, patch: Partial<LineDraft>) => {
    setLines((prev) =>
      prev.map((l) => (l.itemId === itemId ? { ...l, ...patch } : l)),
    );
  };

  const removeLine = (itemId: string) => {
    setLines((prev) => prev.filter((l) => l.itemId !== itemId));
  };

  const flash = (type: "ok" | "err") => {
    setScanFlash(type);
    playScanFeedback(type === "ok" ? "ok" : "error");
    setTimeout(() => setScanFlash(null), 350);
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch {
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

  const isSaving = createMut.isPending || updateMut.isPending;

  const handleSubmit = () => {
    if (!canSubmit || isSaving) return;

    const payload = {
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
    };

    if (isEdit && id) {
      updateMut.mutate(
        { id, data: payload },
        {
          onSuccess: () =>
            router.push(`/dashboard/transaksi-stok/penyesuaian/${id}`),
        },
      );
    } else {
      createMut.mutate(payload, {
        onSuccess: () => router.push(LIST_HREF),
      });
    }
  };

  if (isEdit && (isLoadingDetail || isLoadingItems)) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const backHref = isEdit
    ? `/dashboard/transaksi-stok/penyesuaian/${id}`
    : LIST_HREF;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={
          isEdit
            ? `Ubah Penyesuaian Stok: ${adjustmentNo}`
            : "Buat Penyesuaian Stok"
        }
        description={
          isEdit
            ? "Perbarui rincian, tambah/hapus item, atau sesuaikan stok fisik."
            : "Koreksi jumlah stok riil gudang terhadap data sistem (+ / -)."
        }
        backHref={backHref}
        breadcrumb={[
          { label: "Persediaan" },
          { label: "Transaksi Stok", href: LIST_HREF },
          ...(isEdit
            ? [
                {
                  label: adjustmentNo,
                  href: `/dashboard/transaksi-stok/penyesuaian/${id}`,
                },
                { label: "Ubah" },
              ]
            : [{ label: "Buat Penyesuaian" }]),
        ]}
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
                disabled={isEdit}
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
                Dibuat Oleh
              </Label>
              <UserSelect
                value={createdBy}
                onChange={setCreatedBy}
                placeholder="Pilih pengguna…"
                className="h-9"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-4">
              <Label className="text-xs text-muted-foreground">Catatan</Label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Stok opname bulanan, barang rusak, dsb."
                className="resize-none text-xs"
              />
            </div>
          </div>
        </div>
      </LiquidGlass>

      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Daftar Item Penyesuaian</p>
              <p className="text-xs text-muted-foreground">
                {lines.length} item dipilih • Masukkan selisih (+ / -) untuk
                setiap rak
              </p>
            </div>

            <div className="flex items-center gap-2">
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

          <form onSubmit={handleScanSubmit} className="flex gap-2">
            <div
              className={cn(
                "relative flex-1 rounded-md transition-all duration-300",
                scanFlash === "ok" &&
                  "ring-2 ring-emerald-500 bg-emerald-500/10",
                scanFlash === "err" && "ring-2 ring-rose-500 bg-rose-500/10",
              )}
            >
              <ScanBarcodeIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                ref={scanRef}
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                placeholder={
                  locationId
                    ? "Scan barcode / SKU lalu Enter…"
                    : "Pilih lokasi gudang terlebih dahulu…"
                }
                disabled={!locationId || scanning}
                className="h-10 pl-9 font-mono text-sm"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={!locationId || !scanCode.trim() || scanning}
            >
              {scanning ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Scan"
              )}
            </Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead className="min-w-[220px]">Produk / SKU</TableHead>
                <TableHead className="min-w-[180px]">Rak (Bin)</TableHead>
                <TableHead className="w-32 text-right">Selisih (+ / -)</TableHead>
                <TableHead className="w-24 text-right">Stok Sistem</TableHead>
                <TableHead className="w-24 text-right">Stok Fisik</TableHead>
                <TableHead className="min-w-[180px]">Catatan Baris</TableHead>
                <TableHead className="w-12 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <PackageSearchIcon className="size-8 text-muted-foreground/50" />
                      <p className="text-sm">Belum ada item yang ditambahkan</p>
                      <p className="text-xs">
                        Gunakan tombol <strong>+ Tambah Item</strong> atau scan
                        barcode produk untuk mulai menyesuaikan stok.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((l, index) => {
                  const d = Number(l.delta);
                  const isInvalid =
                    l.delta !== "" && (Number.isNaN(d) || d === 0);
                  const qtyAkhir =
                    l.delta === "" || Number.isNaN(d) ? "—" : l.binOnHand + d;

                  return (
                    <TableRow key={l.itemId}>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground align-top pt-3.5">
                        {index + 1}
                      </TableCell>

                      <TableCell className="align-top py-2.5">
                        <div className="flex items-center gap-3">
                          {l.thumbnail ? (
                            <Image
                              src={l.thumbnail}
                              alt={l.name}
                              width={40}
                              height={40}
                              className="size-10 rounded-lg object-cover border border-border/40 shrink-0"
                            />
                          ) : (
                            <div className="size-10 rounded-lg bg-muted/50 border border-border/40 shrink-0 flex items-center justify-center text-xs font-mono text-muted-foreground">
                              SKU
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-sm truncate max-w-[220px]">
                              {l.name}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {l.sku}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="align-top py-2.5">
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
                        />
                      </TableCell>

                      <TableCell className="align-top py-2.5 text-right">
                        <Input
                          type="number"
                          value={l.delta}
                          onChange={(e) =>
                            updateLine(l.itemId, { delta: e.target.value })
                          }
                          placeholder="+/-"
                          className={cn(
                            "h-9 w-24 text-right font-mono text-xs",
                            isInvalid && "border-destructive focus-visible:ring-destructive",
                          )}
                        />
                      </TableCell>

                      <TableCell className="align-top py-2.5 text-right font-mono text-xs text-muted-foreground pt-3.5">
                        {l.binOnHand}
                      </TableCell>

                      <TableCell className="align-top py-2.5 text-right font-mono text-xs font-semibold pt-3.5">
                        {qtyAkhir}
                      </TableCell>

                      <TableCell className="align-top py-2.5">
                        <Input
                          value={l.notes}
                          onChange={(e) =>
                            updateLine(l.itemId, { notes: e.target.value })
                          }
                          placeholder="Alasan selisih…"
                          className="h-9 text-xs"
                        />
                      </TableCell>

                      <TableCell className="align-top py-2.5 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLine(l.itemId)}
                          className="size-8 text-muted-foreground hover:text-destructive"
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

          {lines.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPickerOpen(true)}
                disabled={!locationId}
                className="gap-1.5"
              >
                <PlusIcon className="size-4" /> Tambah Item Lainnya
              </Button>
            </div>
          )}
        </div>
      </LiquidGlass>

      <FormFooter>
        <Button variant="outline" onClick={() => router.push(backHref)}>
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit || isSaving}>
          {isSaving && <Loader2Icon className="mr-2 size-4 animate-spin" />}
          {isEdit ? "Simpan Perubahan" : "Simpan Penyesuaian"}
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

export function BuatPenyesuaianView() {
  return <PenyesuaianFormPage mode="create" />;
}
