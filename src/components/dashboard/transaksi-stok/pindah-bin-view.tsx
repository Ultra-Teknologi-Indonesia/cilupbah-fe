"use client";
import Image from "next/image";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2Icon,
  PackageSearchIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/can";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageTitle } from "@/components/dashboard/page-title";
import { FormFooter } from "@/components/dashboard/shared/form-footer";
import { ScanAutoflowBar } from "@/components/dashboard/shared/scan-autoflow-bar";
import { UserSelect } from "@/components/dashboard/shared/user-select";
import { QtyConfirmInput } from "@/components/ui/qty-confirm-input";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import { useBinTransferCreate } from "@/hooks/transaksi-stok/use-bin-transfer";
import {
  StockedProductPickerDialog,
  type StockedPickedProduct,
} from "@/components/dashboard/transaksi-stok/stocked-product-picker-dialog";

// eslint-disable-next-line no-restricted-imports
import { InventoryStockService } from "@/services/persediaan/inventory.service";
import { playScanFeedback } from "@/lib/scan-feedback";
import { apiError } from "@/lib/toast";
import { toast } from "sonner";

const LIST_HREF = "/dashboard/transaksi-stok?tab=transfer";

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface AvailableBin {
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
  sourceBinId: string;
  qty: string;
  notes: string;
  availableBins: AvailableBin[];
}

export function PindahBinView() {
  const router = useRouter();
  const [transferNo, setTransferNo] = useState("[auto]");
  const [transferDate, setTransferDate] = useState<Date | undefined>(
    () => new Date(),
  );
  const [locationId, setLocationId] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState<string | undefined>(
    undefined,
  );
  const [scanning, setScanning] = useState(false);
  const [scanRefocusKey, setScanRefocusKey] = useState(0);

  const { data: locData } = useLocations({ perPage: 100 });
  const createMut = useBinTransferCreate();

  const locationOptions = useMemo(
    () =>
      (locData?.items ?? []).map((l) => ({
        value: l.id,
        label: l.locationName,
      })),
    [locData],
  );

  const upsertLineFromVariant = (variant: {
    id: string;
    sku: string;
    product_name: string | null;
    variant_label: string;
    thumbnail_url: string | null;
    primary_bin: { id: string; code: string; on_hand: number } | null;
    available_bins: { id: string; code: string; on_hand: number }[];
  }) => {
    const availableBins = (variant.available_bins ?? [])
      .filter((b) => b.on_hand > 0)
      .map((b) => ({ id: b.id, code: b.code, onHand: b.on_hand }));

    setLines((prev) => {
      if (prev.some((l) => l.itemId === variant.id)) return prev;
      const source =
        variant.primary_bin && variant.primary_bin.on_hand > 0
          ? variant.primary_bin.id
          : (availableBins[0]?.id ?? "");
      const sourceOnHand =
        variant.primary_bin && variant.primary_bin.on_hand > 0
          ? variant.primary_bin.on_hand
          : (availableBins[0]?.onHand ?? 0);
      return [
        ...prev,
        {
          itemId: variant.id,
          sku: variant.sku,
          name: variant.product_name ?? variant.sku,
          variantLabel: variant.variant_label ?? "",
          thumbnail: variant.thumbnail_url ?? null,
          sourceBinId: source,
          qty: sourceOnHand > 0 ? String(sourceOnHand) : "",
          notes: "",
          availableBins,
        },
      ];
    });
  };

  const handleScanCode = async (rawCode: string) => {
    const q = rawCode.trim();
    if (!q || scanning || !locationId) return;

    setScanning(true);
    try {
      const res = await InventoryStockService.bySku(q, locationId, {
        requireStock: true,
      });
      const variant = res.data;

      if (lines.some((l) => l.itemId === variant.id)) {
        playScanFeedback("error");
        toast.error(`SKU "${q}" sudah ditambahkan.`);
        return;
      }
      upsertLineFromVariant(variant);
      playScanFeedback("ok");
    } catch (err) {
      const status = (err as { status?: number })?.status;
      playScanFeedback("error");
      if (status === 404) {
        toast.error(
          `SKU "${q}" tidak ditemukan di gudang ini. Hanya SKU yg punya stok yg bisa ditransfer.`,
        );
      } else if (status === 503) {
        apiError(err, `Gagal mencari SKU "${q}".`);
      } else {
        toast.error(`Gagal mencari SKU "${q}".`);
      }
    } finally {
      setScanning(false);
    }
  };

  const addLinesFromPicker = async (products: StockedPickedProduct[]) => {
    setPickerOpen(false);
    setPickerSearch(undefined);
    if (!locationId) return;

    let added = 0;
    for (const p of products) {
      if (lines.some((l) => l.itemId === p.itemId)) continue;
      try {
        const res = await InventoryStockService.bySku(p.sku, locationId, {
          requireStock: true,
        });
        upsertLineFromVariant(res.data);
        added += 1;
      } catch (error) {
        apiError(error, `Gagal memuat detail rak untuk SKU "${p.sku}".`);
      }
    }
    if (added > 0) {
      toast.success(`${added} produk berhasil ditambahkan.`);
    }
  };

  const updateLine = (itemId: string, patch: Partial<LineDraft>) =>
    setLines((prev) =>
      prev.map((l) => (l.itemId === itemId ? { ...l, ...patch } : l)),
    );
  const removeLine = (itemId: string) =>
    setLines((prev) => prev.filter((l) => l.itemId !== itemId));

  const validLines = lines.filter((l) => {
    const q = Number(l.qty);
    return l.qty !== "" && !Number.isNaN(q) && q > 0 && !!l.sourceBinId;
  });

  const canSubmit =
    !!locationId &&
    !!transferDate &&
    !!createdBy.trim() &&
    lines.length > 0 &&
    validLines.length === lines.length;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const noTrimmed = transferNo.trim();
    const customNo =
      noTrimmed !== "" && noTrimmed !== "[auto]" ? noTrimmed : undefined;
    createMut.mutate(
      {
        location_id: locationId,
        transfer_number: customNo,
        transfer_date: transferDate
          ? toDateInputValue(transferDate)
          : undefined,
        created_by: createdBy.trim(),
        notes: notes.trim() || undefined,
        items: validLines.map((l) => ({
          item_id: l.itemId,
          source_bin_id: l.sourceBinId,
          qty: Number(l.qty),
          notes: l.notes.trim() || undefined,
        })),
      },
      {
        onSuccess: (created) => {
          if (created?.id) {
            router.push(`/dashboard/transaksi-stok/pindah-bin/${created.id}`);
          } else {
            router.push(LIST_HREF);
          }
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title="Transfer Internal"
        backHref={LIST_HREF}
        breadcrumb={[
          { label: "Persediaan" },
          { label: "Transaksi Stok", href: LIST_HREF },
          { label: "Transfer Internal", href: LIST_HREF },
          { label: "Buat" },
        ]}
      />

      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="grid grid-cols-1 gap-4 px-5 py-5 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                No. Transfer Internal{" "}
                <span className="text-destructive">*</span>
              </Label>
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
              <p className="text-xs text-muted-foreground">
                Biarkan <span className="font-mono">[auto]</span> untuk generate
                otomatis (TRFO-…), atau isi manual.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Tanggal <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                value={transferDate}
                onChange={setTransferDate}
                placeholder="Pilih tanggal"
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
                  setLines([]);
                }}
                placeholder="Pilih Lokasi"
                searchPlaceholder="Cari lokasi…"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Dibuat Oleh <span className="text-destructive">*</span>
              </Label>
              <UserSelect
                value={createdBy}
                onChange={setCreatedBy}
                defaultToSelf
                placeholder="Pilih petugas"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label className="text-sm font-medium">Keterangan</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Masukkan Keterangan"
                rows={8}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </LiquidGlass>

      {!locationId ? (
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            i
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Pilih Lokasi</p>
            <p className="text-xs text-muted-foreground">
              Harap pilih Lokasi terlebih dahulu sebelum menambahkan produk. Rak
              tujuan diisi nanti saat penerimaan transfer.
            </p>
          </div>
        </div>
      ) : (
        <LiquidGlass
          radius={16}
          intensity="subtle"
          className="bg-white/40 dark:bg-white/[0.06]"
        >
          <div className="flex flex-col gap-4 px-5 py-5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Produk yang Ditransfer{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPickerOpen(true)}
                className="gap-1.5"
              >
                <PlusIcon className="size-4" /> Tambah Produk
              </Button>
            </div>

            <ScanAutoflowBar
              lines={[]}
              onResolve={() => {}}
              onUnmatched={handleScanCode}
              disabled={scanning || !locationId}
              autoFocus={!!locationId}
              refocusKey={scanRefocusKey}
              scanPlaceholder="Scan / ketik SKU lalu Enter…"
              hint="Hanya SKU yang punya stok di gudang ini yang bisa ditransfer. Rak asal juga bisa di-scan lewat kolom Rak Asal."
              sound={false}
            />

            <Table containerClassName="rounded-lg border border-border">
              <TableHeader className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <TableRow>
                  <TableHead className="px-3 py-2.5 text-muted-foreground">
                    Produk
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-muted-foreground">
                    Rak Asal
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
                    <TableCell colSpan={5} className="px-3 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <PackageSearchIcon className="h-7 w-7 opacity-40" />
                        <p className="text-sm">
                          Belum ada produk. Scan SKU di atas atau klik “Tambah
                          Produk”.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((l) => {
                    const qtyNum = Number(l.qty);
                    const sourceOptions =
                      l.availableBins.length > 0
                        ? l.availableBins.map((b) => ({
                            value: b.id,
                            label: `${b.code} · ${b.onHand} stok`,
                          }))
                        : [];
                    const sourceBin = l.availableBins.find(
                      (b) => b.id === l.sourceBinId,
                    );
                    const qtyOverStock =
                      !!sourceBin && qtyNum > 0 && qtyNum > sourceBin.onHand;
                    return (
                      <TableRow key={l.itemId} className="bg-background/50">
                        <TableCell className="px-3 py-2.5 align-top">
                          <div className="flex max-w-[280px] items-start gap-3">
                            {l.thumbnail ? (
                              <Image
                                unoptimized
                                width={400}
                                height={400}
                                src={l.thumbnail}
                                alt={l.name}
                                className="h-11 w-11 shrink-0 rounded-md border border-border object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted">
                                <PackageSearchIcon className="size-5 text-muted-foreground/40" />
                              </div>
                            )}
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <p className="whitespace-normal break-words text-sm font-medium">
                                {l.name}
                              </p>
                              {l.variantLabel && (
                                <p className="whitespace-normal break-words text-xs text-muted-foreground">
                                  {l.variantLabel}
                                </p>
                              )}
                              <p className="whitespace-normal break-all font-mono text-xs text-muted-foreground">
                                {l.sku}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-2.5">
                          <Combobox
                            options={sourceOptions}
                            value={l.sourceBinId}
                            onChange={(v) =>
                              updateLine(l.itemId, { sourceBinId: v ?? "" })
                            }
                            placeholder={
                              sourceOptions.length === 0
                                ? "Tidak ada stok"
                                : "Scan / pilih rak asal"
                            }
                            searchPlaceholder="Scan / cari rak…"
                            emptyText="Tidak ada rak dengan stok"
                            disabled={sourceOptions.length === 0}
                            className="h-9 min-w-[160px]"
                          />
                          {sourceBin && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Qty di Rak: {sourceBin.onHand}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right">
                          <QtyConfirmInput
                            min={1}
                            max={sourceBin?.onHand ?? 0}
                            expected={sourceBin?.onHand ?? 0}
                            warnOnly
                            value={l.qty === "" ? "" : Number(l.qty)}
                            onChange={(v) =>
                              updateLine(l.itemId, {
                                qty: v === "" ? "" : String(v),
                              })
                            }
                            onEnter={() => setScanRefocusKey((k) => k + 1)}
                            placeholder="0"
                            className="h-9 w-24 text-right"
                          />
                          {sourceBin && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              dari {sourceBin.onHand}
                            </p>
                          )}
                          {qtyOverStock && sourceBin && (
                            <p className="text-amber-600 text-xs">
                              Melebihi data sistem (tersedia: {sourceBin.onHand}
                              ) — akan tercatat minus
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-2.5">
                          <Input
                            value={l.notes}
                            onChange={(e) =>
                              updateLine(l.itemId, { notes: e.target.value })
                            }
                            placeholder="Opsional"
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

            {lines.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Total {validLines.length} dari {lines.length} baris siap
                ditransfer. Setiap baris wajib punya rak asal (dari rak yang
                menyimpan SKU tsb) dan qty &gt; 0. Rak tujuan diisi saat
                penerimaan transfer.
              </p>
            )}
          </div>
        </LiquidGlass>
      )}

      <FormFooter>
        <Button variant="outline" onClick={() => router.push(LIST_HREF)}>
          Batal
        </Button>
        <Can permission="create-pindah-bin">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createMut.isPending}
          >
            {createMut.isPending && (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            )}
            Simpan
          </Button>
        </Can>
      </FormFooter>

      <StockedProductPickerDialog
        open={pickerOpen}
        onOpenChange={(v) => {
          setPickerOpen(v);
          if (!v) setPickerSearch(undefined);
        }}
        onPick={addLinesFromPicker}
        locationId={locationId}
        excludeIds={lines.map((l) => l.itemId)}
        initialSearch={pickerSearch}
      />
    </div>
  );
}
