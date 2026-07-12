"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2Icon,
  SaveIcon,
  SearchIcon,
  Trash2Icon,
  RotateCcwIcon,
  FilterXIcon,
  PackageOpenIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/dashboard/page-title";
import { FormFooter } from "@/components/dashboard/shared/form-footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  usePurchaseOrderDetail,
  useReceivablePurchaseOrders,
} from "@/hooks/barang-masuk/use-purchase-orders-inbound";
import { useReceivePurchaseOrder } from "@/hooks/barang-masuk/use-receive-purchase-order";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import type {
  PurchaseOrder,
  PurchaseOrderItem,
} from "@/types/transaksi-pembelian/purchase-order";
import { cn } from "@/lib/utils";

interface DraftItem {
  id: string;
  purchase_order_item_id: string;
  item_id: string;
  sku: string;
  product_name: string;
  variant_name: string;
  image_url?: string;
  ordered_qty: number;
  already_received: number;
  pending_qty: number;
  unit: string | null;
  qty: number;
}

const uniqSorted = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "id"),
  );

const normalize = (s: string) => s.trim().toLowerCase();

function toDraft(po: PurchaseOrder): DraftItem[] {
  return (po.items ?? []).map((it: PurchaseOrderItem) => {
    const pending = Math.max(0, it.qty - (it.received_qty ?? 0));
    return {
      id: it.id,
      purchase_order_item_id: it.id,
      item_id: it.item_id,
      sku: it.product?.sku ?? "",
      product_name: it.product?.name ?? "",
      variant_name:
        it.variant?.name ?? it.variant?.options?.map((o) => o.value).join(", ") ?? "",
      image_url:
        it.product?.image_url ??
        it.product?.media?.[0]?.url ??
        it.variant?.media?.[0]?.url,
      ordered_qty: it.qty,
      already_received: it.received_qty ?? 0,
      pending_qty: pending,
      unit: it.unit,
      qty: pending,
    };
  });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function TambahPenerimaanFormPage() {
  const [poId, setPoId] = React.useState<string>("");
  const [poQuery, setPoQuery] = React.useState("");

  const receivable = useReceivablePurchaseOrders({
    "filter[status]": "OPEN,PARTIAL_RECEIVED",
    search: poQuery || undefined,
    per_page: 50,
    sort: "-order_date",
  });

  const poOptions = React.useMemo(
    () =>
      (receivable.data?.items ?? []).map((p) => ({
        value: p.id,
        label: p.po_number,
        hint: p.contact?.name ?? "",
      })),
    [receivable.data],
  );

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Penerimaan Barang"
        description="Catat barang yang benar-benar diterima. SKU yang belum datang bisa disaring dan dihapus dari draft."
        breadcrumb={[
          { label: "Barang Masuk", href: "/dashboard/barang-masuk?tab=pesanan" },
          { label: "Penerimaan Barang" },
        ]}
        backHref="/dashboard/barang-masuk?tab=pesanan"
      />

      <div className="rounded-2xl border border-border bg-card px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label htmlFor="po">Pesanan Pembelian *</Label>
            <Combobox
              id="po"
              options={poOptions}
              value={poId || null}
              onChange={(v) => setPoId(v ?? "")}
              placeholder="Pilih PO"
              searchPlaceholder="Cari No. PO / pemasok"
              emptyText={receivable.isFetching ? "Memuat…" : "Tidak ada PO"}
              onQueryChange={setPoQuery}
              loading={receivable.isFetching}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Hanya PO berstatus <span className="font-medium">Sedang Berjalan</span> /{" "}
            <span className="font-medium">Diterima Sebagian</span>.
          </p>
        </div>
      </div>

      {poId ? (
        <ReceivePoBody key={poId} poId={poId} />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8">
          <EmptyState
            icon={PackageOpenIcon}
            title="Pilih pesanan pembelian dahulu"
            description="Daftar SKU dan aksi penerimaan muncul setelah Anda memilih PO di atas."
          />
        </div>
      )}
    </div>
  );
}

interface ReceivePoBodyProps {
  poId: string;
}

function ReceivePoBody({ poId }: ReceivePoBodyProps) {
  const router = useRouter();
  const detail = usePurchaseOrderDetail(poId);
  const po = detail.data ?? null;

  if (!po || detail.isPending) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Memuat detail pesanan pembelian…
      </div>
    );
  }

  return <ReceivePoForm po={po} onDone={() => router.push("/dashboard/barang-masuk?tab=pesanan")} />;
}

interface ReceivePoFormProps {
  po: PurchaseOrder;
  onDone: () => void;
}

function ReceivePoForm({ po, onDone }: ReceivePoFormProps) {
  const receive = useReceivePurchaseOrder();
  const { data: locData } = useLocations({ perPage: 100 });

  const [refNumber, setRefNumber] = React.useState(po.po_number ?? "");
  const [receiveDate, setReceiveDate] = React.useState(todayIso());
  const [notes, setNotes] = React.useState("");
  const [locationId, setLocationId] = React.useState(po.location_id ?? "");

  const [items, setItems] = React.useState<DraftItem[]>(() => toDraft(po));
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const [q, setQ] = React.useState("");
  const [dq, setDq] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setDq(q), 200);
    return () => clearTimeout(t);
  }, [q]);
  const [productId, setProductId] = React.useState<string>("");
  const [variantValues, setVariantValues] = React.useState<string[]>([]);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [scanValue, setScanValue] = React.useState("");
  const [lastDeleted, setLastDeleted] = React.useState<DraftItem[] | null>(null);

  const productOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const it of items) {
      if (!map.has(it.item_id)) map.set(it.item_id, it.product_name);
    }
    return [
      { value: "", label: "Semua Produk" },
      ...Array.from(map.entries())
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label, "id")),
    ];
  }, [items]);

  const variantOptions = React.useMemo(() => {
    const values = uniqSorted(
      items
        .flatMap((it) => it.variant_name.split(",").map((s) => s.trim()))
        .filter(Boolean),
    );
    return values.map((v) => ({ value: v, label: v }));
  }, [items]);

  const locationOptions = React.useMemo(
    () =>
      (locData?.items ?? []).map((l) => ({
        value: l.id,
        label: l.locationName,
      })),
    [locData],
  );

  const visibleItems = React.useMemo(() => {
    const dqn = normalize(dq);
    const vset = new Set(variantValues.map(normalize));
    return items.filter((it) => {
      if (dqn) {
        const hay = `${it.sku} ${it.product_name} ${it.variant_name}`.toLowerCase();
        if (!hay.includes(dqn)) return false;
      }
      if (productId && it.item_id !== productId) return false;
      if (vset.size > 0) {
        const values = it.variant_name.split(",").map((s) => normalize(s.trim()));
        if (!values.some((v) => vset.has(v))) return false;
      }
      return true;
    });
  }, [items, dq, productId, variantValues]);

  const visibleIds = React.useMemo(
    () => new Set(visibleItems.map((v) => v.id)),
    [visibleItems],
  );

  const selectedVisibleIds = React.useMemo(
    () =>
      new Set(Array.from(selectedIds).filter((id) => visibleIds.has(id))),
    [selectedIds, visibleIds],
  );

  const totalQty = React.useMemo(
    () => items.reduce((s, it) => s + (Number.isFinite(it.qty) ? it.qty : 0), 0),
    [items],
  );

  const hasActiveFilter = !!dq || !!productId || variantValues.length > 0;

  const allVisibleSelected =
    visibleItems.length > 0 && visibleItems.every((v) => selectedIds.has(v.id));
  const someVisibleSelected =
    !allVisibleSelected && visibleItems.some((v) => selectedIds.has(v.id));

  function toggleAllVisible(next: boolean) {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (next) {
        for (const v of visibleItems) n.add(v.id);
      } else {
        for (const v of visibleItems) n.delete(v.id);
      }
      return n;
    });
  }

  function toggleRow(id: string, next: boolean) {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (next) n.add(id);
      else n.delete(id);
      return n;
    });
  }

  function updateQty(id: string, raw: string) {
    const n = Number(raw);
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              qty: Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0,
            }
          : it,
      ),
    );
  }

  function pushUndoSnapshot(removed: DraftItem[]) {
    setLastDeleted(removed);
    toast.success(
      removed.length === 1
        ? "1 SKU dihapus dari draft penerimaan"
        : `${removed.length} SKU dihapus dari draft penerimaan`,
      {
        action: {
          label: "Urungkan",
          onClick: () => restoreDeleted(removed),
        },
      },
    );
  }

  function restoreDeleted(removed: DraftItem[]) {
    const original = toDraft(po);
    const orderMap = new Map(original.map((o, i) => [o.id, i]));
    setItems((prev) => {
      const set = new Set(prev.map((p) => p.id));
      const merged = [...prev];
      for (const r of removed) {
        if (!set.has(r.id)) merged.push(r);
      }
      merged.sort(
        (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
      );
      return merged;
    });
    setLastDeleted(null);
  }

  function deleteOne(id: string) {
    const removed = items.find((it) => it.id === id);
    if (!removed) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    pushUndoSnapshot([removed]);
  }

  function confirmBulkDelete() {
    const removed = items.filter((it) => selectedVisibleIds.has(it.id));
    if (removed.length === 0) return;
    setItems((prev) => prev.filter((it) => !selectedVisibleIds.has(it.id)));
    setSelectedIds((prev) => {
      const n = new Set(prev);
      for (const id of selectedVisibleIds) n.delete(id);
      return n;
    });
    setConfirmOpen(false);
    pushUndoSnapshot(removed);
  }

  function resetAllFilters() {
    setQ("");
    setDq("");
    setProductId("");
    setVariantValues([]);
  }

  function restoreAllPoItems() {
    setItems(toDraft(po));
    setSelectedIds(new Set());
    resetAllFilters();
    toast.success("Semua item pesanan pembelian dikembalikan");
  }

  function handleScan() {
    const code = scanValue.trim();
    if (!code) return;
    const removedMatch = lastDeleted?.find(
      (r) => normalize(r.sku) === normalize(code),
    );
    const target =
      items.find((it) => normalize(it.sku) === normalize(code)) ??
      items.find((it) => normalize(it.product_name).includes(normalize(code)));

    if (!target) {
      if (removedMatch) {
        toast.warning(
          "SKU sudah dihapus dari daftar. Kembalikan dulu untuk menambah qty.",
        );
      } else {
        toast.error("SKU tidak ada di daftar pesanan.");
      }
      setScanValue("");
      return;
    }
    if (target.qty >= target.pending_qty) {
      toast.warning(
        `Qty sudah mencapai sisa outstanding (${target.pending_qty}).`,
      );
      setScanValue("");
      return;
    }
    setItems((prev) =>
      prev.map((it) =>
        it.id === target.id ? { ...it, qty: it.qty + 1 } : it,
      ),
    );
    setScanValue("");
  }

  const hasQtyError = React.useMemo(
    () => items.some((it) => it.qty > it.pending_qty),
    [items],
  );

  const canSubmit =
    !!locationId &&
    items.length > 0 &&
    !hasQtyError &&
    items.some((it) => it.qty > 0) &&
    !receive.isPending;

  function handleSubmit() {
    if (!canSubmit) return;
    const payloadItems = items
      .filter((it) => it.qty > 0)
      .map((it) => ({
        purchase_order_item_id: it.purchase_order_item_id,
        qty: it.qty,
      }));
    if (payloadItems.length === 0) {
      toast.error("Isi jumlah diterima minimal 1 untuk salah satu SKU.");
      return;
    }
    receive.mutate(
      {
        id: po.id,
        data: {
          reference_number: refNumber || undefined,
          location_id: locationId || undefined,
          receive_date: receiveDate,
          notes: notes || undefined,
          items: payloadItems,
        },
      },
      { onSuccess: () => onDone() },
    );
  }

  const bulkCount = selectedVisibleIds.size;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ref">No. Ref</Label>
              <Input
                id="ref"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="Masukkan no. ref"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Pemasok</Label>
              <Input
                disabled
                value={po.contact?.name ?? "—"}
                className="disabled:opacity-100"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Tanggal *</Label>
              <Input
                id="date"
                type="date"
                value={receiveDate}
                onChange={(e) => setReceiveDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc">Lokasi *</Label>
              <Combobox
                id="loc"
                options={locationOptions}
                value={locationId || null}
                onChange={(v) => setLocationId(v ?? "")}
                placeholder="Pilih lokasi"
                searchPlaceholder="Cari lokasi"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Keterangan</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan opsional"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleScan();
                  }
                }}
                placeholder="Scan produk (SKU)"
                className="pl-9"
                disabled={items.length === 0}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[14rem] flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari SKU / produk / varian"
                  className="pl-9"
                  disabled={items.length === 0}
                />
              </div>
              <Combobox
                options={productOptions}
                value={productId || null}
                onChange={(v) => setProductId(v ?? "")}
                placeholder="Produk"
                searchPlaceholder="Cari produk"
                className="w-48"
                disabled={items.length === 0}
              />
              <Combobox
                multiple
                options={variantOptions}
                value={variantValues}
                onChange={(v) => setVariantValues(v)}
                placeholder="Varian"
                searchPlaceholder="Cari varian"
                className="w-52"
                disabled={variantOptions.length === 0}
              />
              {hasActiveFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={resetAllFilters}
                >
                  <FilterXIcon className="size-4" />
                  Reset
                </Button>
              )}
              <div className="ml-auto text-sm text-muted-foreground">
                {hasActiveFilter ? (
                  <>
                    Menampilkan{" "}
                    <span className="font-semibold text-foreground">
                      {visibleItems.length}
                    </span>{" "}
                    dari {items.length} SKU
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">
                      {items.length}
                    </span>{" "}
                    SKU
                  </>
                )}
              </div>
            </div>
          </div>

          {bulkCount > 0 && (
            <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/40 px-5 py-3">
              <div className="text-sm">
                <span className="font-semibold">{bulkCount} dipilih</span>
                {selectedIds.size > bulkCount && (
                  <span className="ml-2 text-muted-foreground">
                    ({selectedIds.size} total, {bulkCount} terlihat sesuai
                    filter)
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 gap-1.5"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2Icon className="size-4" />
                Hapus ({bulkCount})
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            {items.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={PackageOpenIcon}
                  title="Semua item dihapus dari draft"
                  description="Kembalikan seluruh item untuk mulai lagi, atau pilih PO lain."
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={restoreAllPoItems}
                  >
                    <RotateCcwIcon className="size-4" />
                    Kembalikan semua item PO
                  </Button>
                </EmptyState>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          allVisibleSelected
                            ? true
                            : someVisibleSelected
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={(v) => toggleAllVisible(!!v)}
                        aria-label={
                          hasActiveFilter
                            ? `Pilih semua yang cocok filter (${visibleItems.length})`
                            : `Pilih semua (${items.length})`
                        }
                      />
                    </TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-right">Qty Terima</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        Tidak ada SKU cocok filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleItems.map((it) => {
                      const overPending = it.qty > it.pending_qty;
                      return (
                        <TableRow
                          key={it.id}
                          data-state={
                            selectedIds.has(it.id) ? "selected" : undefined
                          }
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(it.id)}
                              onCheckedChange={(v) => toggleRow(it.id, !!v)}
                              aria-label="Pilih baris"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {it.image_url ? (
                                <Image
                                  src={it.image_url}
                                  alt=""
                                  width={40}
                                  height={40}
                                  unoptimized
                                  className="size-10 shrink-0 rounded-xl border border-border/60 object-cover"
                                />
                              ) : (
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted">
                                  <PackageOpenIcon className="size-4 text-muted-foreground" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium">
                                  {it.product_name || it.sku}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">
                                  {it.sku}
                                  {it.variant_name
                                    ? ` · ${it.variant_name}`
                                    : ""}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {it.pending_qty}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <Input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={it.pending_qty}
                                value={String(it.qty)}
                                onChange={(e) =>
                                  updateQty(it.id, e.target.value)
                                }
                                aria-invalid={overPending || undefined}
                                className={cn(
                                  "h-9 w-24 text-right tabular-nums",
                                  overPending &&
                                    "border-destructive ring-3 ring-destructive/20",
                                )}
                              />
                              {overPending && (
                                <span className="text-[11px] text-destructive">
                                  Melebihi {it.pending_qty}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {it.unit ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => deleteOne(it.id)}
                              aria-label="Hapus baris"
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
            )}
          </div>
        </div>

        <FormFooter>
          <Button variant="outline" asChild>
            <Link href="/dashboard/barang-masuk?tab=pesanan">Batal</Link>
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="gap-1.5"
          >
            {receive.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SaveIcon className="size-4" />
            )}
            Simpan
          </Button>
        </FormFooter>
      </div>

      <aside className="lg:sticky lg:top-4 lg:h-fit">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total Qty</span>
            <span className="text-2xl font-bold tabular-nums">{totalQty}</span>
          </div>
          {items.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>SKU aktif</span>
                <span className="tabular-nums">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>SKU dengan qty 0</span>
                <span className="tabular-nums">
                  {items.filter((it) => it.qty === 0).length}
                </span>
              </div>
            </div>
          )}
          {hasQtyError && (
            <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Ada qty melebihi outstanding. Perbaiki dulu sebelum menyimpan.
            </p>
          )}
        </div>
      </aside>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="destructive"
        title={`Hapus ${bulkCount} SKU dari daftar penerimaan?`}
        description={
          hasActiveFilter
            ? `Filter aktif akan menyaring aksi. ${
                selectedIds.size > bulkCount
                  ? `${selectedIds.size} terpilih total, ${bulkCount} terlihat sesuai filter. Hanya ${bulkCount} yang terlihat akan dihapus.`
                  : `${bulkCount} SKU terlihat sesuai filter akan dihapus.`
              } Anda bisa Urungkan lewat toast setelahnya.`
            : `${bulkCount} SKU akan dihapus dari draft. Anda bisa Urungkan lewat toast setelahnya.`
        }
        confirmLabel={`Hapus ${bulkCount} SKU`}
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}
