"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  Loader2Icon,
  PackageSearchIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { PageTitle } from "@/components/dashboard/page-title";
import { UserSelect } from "@/components/dashboard/shared/user-select";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import {
  useBinTransferCreate,
  useLocationBins,
} from "@/hooks/transaksi-stok/use-bin-transfer";
import {
  ProductPickerDialog,
  type PickedProduct,
} from "@/components/dashboard/transaksi-pembelian/product-picker-dialog";
import { cn } from "@/lib/utils";

const LIST_HREF = "/dashboard/transaksi-stok?tab=transfer";

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface LineDraft {
  itemId: string;
  sku: string;
  name: string;
  variantLabel: string;
  thumbnail: string | null;
  qty: string;
  notes: string;
}

export function PindahBinView() {
  const router = useRouter();
  const [transferNo, setTransferNo] = useState("[auto]");
  const [transferDate, setTransferDate] = useState<Date | undefined>(
    () => new Date(),
  );
  const [locationId, setLocationId] = useState("");
  const [sourceBinId, setSourceBinId] = useState("");
  const [destBinId, setDestBinId] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: locData } = useLocations({ perPage: 100 });
  const { data: binData, isLoading: binsLoading } = useLocationBins(locationId);
  const createMut = useBinTransferCreate();

  const locationOptions = useMemo(
    () =>
      (locData?.items ?? []).map((l) => ({
        value: l.id,
        label: l.locationName,
      })),
    [locData],
  );

  const binOptions = useMemo(
    () =>
      (binData?.items ?? []).map((b) => ({
        value: b.id,
        label: b.binFinalCode,
      })),
    [binData],
  );

  const addLines = (
    products: (PickedProduct & {
      variantLabel?: string;
      thumbnail?: string | null;
    })[],
  ) => {
    setLines((prev) => {
      const existing = new Set(prev.map((l) => l.itemId));
      const fresh = products
        .filter((p) => !existing.has(p.itemId))
        .map<LineDraft>((p) => ({
          itemId: p.itemId,
          sku: p.sku,
          name: p.name,
          variantLabel: p.variantLabel ?? "",
          thumbnail: p.thumbnail ?? null,
          qty: "",
          notes: "",
        }));
      return [...prev, ...fresh];
    });
    setPickerOpen(false);
  };

  const updateLine = (itemId: string, patch: Partial<LineDraft>) =>
    setLines((prev) =>
      prev.map((l) => (l.itemId === itemId ? { ...l, ...patch } : l)),
    );
  const removeLine = (itemId: string) =>
    setLines((prev) => prev.filter((l) => l.itemId !== itemId));

  const validLines = lines.filter((l) => {
    const q = Number(l.qty);
    return l.qty !== "" && !Number.isNaN(q) && q > 0;
  });

  const canSubmit =
    !!locationId &&
    !!sourceBinId &&
    !!destBinId &&
    sourceBinId !== destBinId &&
    !!transferDate &&
    !!createdBy.trim() &&
    validLines.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const noTrimmed = transferNo.trim();
    const customNo =
      noTrimmed !== "" && noTrimmed !== "[auto]" ? noTrimmed : undefined;
    createMut.mutate(
      {
        location_id: locationId,
        source_bin_id: sourceBinId,
        destination_bin_id: destBinId,
        transfer_number: customNo,
        transfer_date: transferDate ? toDateInputValue(transferDate) : undefined,
        created_by: createdBy.trim(),
        notes: notes.trim() || undefined,
        items: validLines.map((l) => ({
          item_id: l.itemId,
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
                No. Transfer Internal <span className="text-red-500">*</span>
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
                Biarkan{" "}
                <span className="font-mono">[auto]</span> untuk generate
                otomatis (TRFI-…), atau isi manual.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                value={transferDate}
                onChange={setTransferDate}
                placeholder="Pilih tanggal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Lokasi <span className="text-red-500">*</span>
              </Label>
              <Combobox
                options={locationOptions}
                value={locationId}
                onChange={(v) => {
                  setLocationId(v ?? "");
                  setSourceBinId("");
                  setDestBinId("");
                }}
                placeholder="Pilih Lokasi"
                searchPlaceholder="Cari lokasi…"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">
                  Rak Asal <span className="text-red-500">*</span>
                </Label>
                <Combobox
                  options={binOptions.filter((b) => b.value !== destBinId)}
                  value={sourceBinId}
                  onChange={(v) => setSourceBinId(v ?? "")}
                  placeholder={binsLoading ? "Memuat…" : "Pilih rak asal"}
                  searchPlaceholder="Cari rak…"
                  disabled={!locationId || binsLoading}
                />
              </div>
              <ArrowRightIcon className="mb-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">
                  Rak Tujuan <span className="text-red-500">*</span>
                </Label>
                <Combobox
                  options={binOptions.filter((b) => b.value !== sourceBinId)}
                  value={destBinId}
                  onChange={(v) => setDestBinId(v ?? "")}
                  placeholder={binsLoading ? "Memuat…" : "Pilih rak tujuan"}
                  searchPlaceholder="Cari rak…"
                  disabled={!locationId || binsLoading}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Dibuat Oleh <span className="text-red-500">*</span>
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

      {!locationId || !sourceBinId || !destBinId ? (
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            i
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Pilih Lokasi, Rak Asal, dan Rak Tujuan
            </p>
            <p className="text-xs text-muted-foreground">
              Harap pilih Lokasi beserta Rak Asal dan Rak Tujuan terlebih
              dahulu sebelum menambahkan produk.
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
                <span className="text-red-500">*</span>
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPickerOpen(true)}
                className="gap-1.5"
              >
                <PlusIcon className="h-4 w-4" /> Tambah Produk
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium">
                      Produk
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium">
                      Qty Pindah
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium">
                      Keterangan
                    </th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lines.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <PackageSearchIcon className="h-7 w-7 opacity-40" />
                          <p className="text-sm">
                            Belum ada produk. Klik “Tambah Produk” untuk
                            memilih produk yang akan ditransfer.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    lines.map((l) => {
                      const qtyNum = Number(l.qty);
                      const invalid =
                        l.qty !== "" &&
                        (Number.isNaN(qtyNum) || qtyNum <= 0);
                      return (
                        <tr key={l.itemId} className="bg-background/50">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-3">
                              {l.thumbnail ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={l.thumbnail}
                                  alt={l.name}
                                  className="h-11 w-11 shrink-0 rounded-md border border-border object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted">
                                  <PackageSearchIcon className="h-5 w-5 text-muted-foreground/40" />
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
                                <p className="truncate font-mono text-[11px] text-muted-foreground">
                                  {l.sku}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <Input
                              type="number"
                              min={1}
                              value={l.qty}
                              onChange={(e) =>
                                updateLine(l.itemId, { qty: e.target.value })
                              }
                              placeholder="0"
                              className={cn(
                                "h-9 w-24 text-right",
                                invalid &&
                                  "border-destructive ring-1 ring-destructive/30",
                              )}
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <Input
                              value={l.notes}
                              onChange={(e) =>
                                updateLine(l.itemId, { notes: e.target.value })
                              }
                              placeholder="Opsional"
                              className="h-9 min-w-[160px]"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeLine(l.itemId)}
                              aria-label="Hapus"
                              className="text-destructive"
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {lines.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Total {validLines.length} produk siap ditransfer dari{" "}
                <span className="font-mono">
                  {binOptions.find((b) => b.value === sourceBinId)?.label ??
                    "—"}
                </span>{" "}
                ke{" "}
                <span className="font-mono">
                  {binOptions.find((b) => b.value === destBinId)?.label ?? "—"}
                </span>
                .
              </p>
            )}
          </div>
        </LiquidGlass>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push(LIST_HREF)}>
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || createMut.isPending}
        >
          {createMut.isPending && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}
          Simpan
        </Button>
      </div>

      <ProductPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={addLines}
        excludeIds={lines.map((l) => l.itemId)}
      />
    </div>
  );
}
