"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  Loader2Icon,
  PackageCheckIcon,
  ImageIcon,
  CheckCircle2Icon,
  XCircleIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { PageTitle } from "@/components/dashboard/page-title";
import { QtyConfirmInput } from "@/components/ui/qty-confirm-input";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { SortableHeader } from "@/components/dashboard/shared/sortable-header";
import { SectionTitle } from "@/components/dashboard/shared/section-title";
import {
  usePurchaseOrderDetail,
  usePurchaseOrderItems,
} from "@/hooks/transaksi-pembelian/use-purchase-orders";
import { useReceivePurchaseOrder } from "@/hooks/barang-masuk/use-receive-purchase-order";

interface ItemQty {
  purchase_order_item_id: string;
  accepted: number;
  rejected: number;
  rejection_note: string;
  remaining: number;
  notes: string;
}

export function TerimaPOView({ id }: { id: string }) {
  const router = useRouter();
  const { data: po, isLoading } = usePurchaseOrderDetail(id);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<string | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: itemsRes, isFetching: isFetchingItems } = usePurchaseOrderItems(
    id,
    { page, perPage, search: debouncedSearch || undefined, sort },
  );
  const items = itemsRes?.data ?? [];
  const itemsMeta = itemsRes?.meta;

  const handleSort = (next: string | undefined) => {
    setSort(next);
    setPage(1);
  };

  const receiveMutation = useReceivePurchaseOrder();

  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiveDate, setReceiveDate] = useState<Date>(() => new Date());
  const [notes, setNotes] = useState("");

  const [itemQtys, setItemQtys] = useState<Record<string, ItemQty>>({});

  useEffect(() => {
    if (items.length > 0) {
      setItemQtys((prev) => {
        const next = { ...prev };
        let hasChanges = false;
        items.forEach((item) => {
          if (!next[item.id]) {
            const remaining = item.qty - item.received_qty;
            if (remaining > 0) {
              next[item.id] = {
                purchase_order_item_id: item.id,
                accepted: remaining,
                rejected: 0,
                rejection_note: "",
                remaining,
                notes: "",
              };
              hasChanges = true;
            }
          }
        });
        return hasChanges ? next : prev;
      });
    }
  }, [items]);

  const hasValidQty = useMemo(
    () =>
      Object.values(itemQtys).some((i) => i.accepted > 0 || i.rejected > 0),
    [itemQtys],
  );

  const hasOverQty = useMemo(
    () =>
      Object.values(itemQtys).some((i) => i.accepted + i.rejected > i.remaining),
    [itemQtys],
  );

  const canSubmit = hasValidQty && !hasOverQty && !receiveMutation.isPending;

  const totalAccepted = useMemo(
    () => Object.values(itemQtys).reduce((s, i) => s + i.accepted, 0),
    [itemQtys],
  );

  const totalRejected = useMemo(
    () => Object.values(itemQtys).reduce((s, i) => s + i.rejected, 0),
    [itemQtys],
  );

  function handleAcceptedChange(itemId: string, remaining: number, value: number) {
    setItemQtys((prev) => {
      const current = prev[itemId];
      const accepted = Math.max(0, Math.min(value, remaining));
      const rejected = remaining - accepted;
      return {
        ...prev,
        [itemId]: {
          ...current,
          purchase_order_item_id: itemId,
          remaining,
          accepted,
          rejected,
          rejection_note: rejected === 0 ? "" : (current?.rejection_note ?? ""),
        },
      };
    });
  }

  function handleRejectedChange(itemId: string, remaining: number, value: number) {
    setItemQtys((prev) => {
      const current = prev[itemId];
      const rejected = Math.max(0, Math.min(value, remaining));
      const accepted = remaining - rejected;
      return {
        ...prev,
        [itemId]: {
          ...current,
          purchase_order_item_id: itemId,
          remaining,
          accepted,
          rejected,
          rejection_note: rejected === 0 ? "" : (current?.rejection_note ?? ""),
        },
      };
    });
  }

  function handleRejectionNoteChange(itemId: string, value: string) {
    setItemQtys((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        rejection_note: value,
      },
    }));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    receiveMutation.mutate(
      {
        id,
        data: {
          reference_number: referenceNumber.trim() || undefined,
          receive_date: format(receiveDate, "yyyy-MM-dd"),
          location_id: po?.location_id,
          notes: notes.trim() || undefined,
          items: Object.values(itemQtys)
            .filter((i) => i.accepted > 0 || i.rejected > 0)
            .map((i) => ({
              purchase_order_item_id: i.purchase_order_item_id,
              qty: i.accepted,
              rejected_qty: i.rejected || undefined,
              rejection_note: i.rejection_note.trim() || undefined,
              notes: i.notes.trim() || undefined,
            })),
        },
      },
      {
        onSuccess: () => router.push("/dashboard/barang-masuk/penerimaan"),
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Terima Barang — PO"
        description={po ? `Penerimaan untuk ${po.po_number}` : "Memuat..."}
        backHref="/dashboard/barang-masuk"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Barang Masuk", href: "/dashboard/barang-masuk" },
          { label: "Terima PO" },
        ]}
      />

      {isLoading ? (
        <LiquidGlass
          radius={20}
          intensity="subtle"
          className="bg-white/30 p-6 dark:bg-white/[0.04]"
        >
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </LiquidGlass>
      ) : !po ? (
        <LiquidGlass
          radius={20}
          intensity="subtle"
          className="bg-white/30 p-6 dark:bg-white/[0.04]"
        >
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <p className="text-sm font-medium">PO tidak ditemukan</p>
            <Link href="/dashboard/barang-masuk">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="mr-1.5 size-4" />
                Kembali
              </Button>
            </Link>
          </div>
        </LiquidGlass>
      ) : (
        <div className="flex flex-col gap-4">
          <LiquidGlass
            radius={20}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04]"
          >
            <div className="px-5 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Pemasok
                    </Label>
                    <Input value={po.contact?.name ?? "—"} disabled />
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      No. Ref
                    </Label>
                    <Input
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="Masukkan no. ref"
                    />
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Tanggal <span className="text-destructive">*</span>
                    </Label>
                    <DatePicker
                      value={receiveDate}
                      onChange={(date) => date && setReceiveDate(date)}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Pesanan Pembelian
                    </Label>
                    <Input value={po.po_number} disabled />
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Lokasi
                    </Label>
                    <Input value={po.location?.location_name ?? "—"} disabled />
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                    <Label className="text-sm font-medium text-muted-foreground mt-2">
                      Keterangan
                    </Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Masukkan keterangan disini"
                    />
                  </div>
                </div>
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass
            radius={20}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04]"
          >
            <div className="px-5 py-4">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SectionTitle>Daftar Produk</SectionTitle>
                <div className="relative w-full sm:w-72">
                  <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari SKU atau nama produk..."
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow className="border-b border-border/60 bg-muted/30">
                      <TableHead className="text-muted-foreground">
                        <SortableHeader
                          label="Produk"
                          field="sku"
                          currentSort={sort}
                          onSort={handleSort}
                        />
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-muted-foreground w-16 text-center">
                        Sisa
                      </TableHead>
                      <TableHead className="whitespace-nowrap w-28">
                        <span className="flex items-center gap-1.5 text-success">
                          <CheckCircle2Icon className="size-3.5" />
                          Diterima
                        </span>
                      </TableHead>
                      <TableHead className="whitespace-nowrap w-28">
                        <span className="flex items-center gap-1.5 text-destructive">
                          <XCircleIcon className="size-3.5" />
                          Ditolak
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const remaining = item.qty - item.received_qty;
                      const row = itemQtys[item.id];
                      const currentAccepted = row?.accepted ?? 0;
                      const currentRejected = row?.rejected ?? 0;
                      const variantName = item.variant?.options?.length
                        ? item.variant.options.map((o) => o.value).join(", ")
                        : item.variant?.name;
                      const productName = variantName
                        ? `${item.product?.name} - ${variantName}`
                        : (item.product?.name ?? item.description ?? "—");
                      const imageUrl =
                        item.variant?.media?.[0]?.url ??
                        item.product?.media?.[0]?.url ??
                        item.product?.image_url;

                      return (
                        <Fragment key={item.id}>
                          <TableRow className="border-b border-border/20">
                            <TableCell className="px-3 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted/50">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={productName}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                      <ImageIcon className="size-4 opacity-50" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium whitespace-normal break-words leading-snug">
                                    {productName}
                                  </div>
                                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span>{item.product?.sku ?? "—"}</span>
                                    <span className="text-border">·</span>
                                    <span>Pesanan: {item.qty}</span>
                                    <span className="text-border">·</span>
                                    <span>
                                      Sudah diterima: {item.received_qty}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-3 py-3 text-center">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs tabular-nums",
                                  remaining > 0
                                    ? "border-warning/60 text-warning"
                                    : "border-success/60 text-success",
                                )}
                              >
                                {remaining}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-3 py-3">
                              {remaining > 0 ? (
                                <QtyConfirmInput
                                  min={0}
                                  max={remaining - currentRejected}
                                  expected={remaining - currentRejected}
                                  value={currentAccepted === 0 ? "" : currentAccepted}
                                  onChange={(v) =>
                                    handleAcceptedChange(
                                      item.id,
                                      remaining,
                                      v === "" ? 0 : Number(v),
                                    )
                                  }
                                  onEnter={() => {
                                    if (canSubmit) handleSubmit();
                                  }}
                                  className="h-9 w-20 tabular-nums border-success/40 bg-success/10 focus-visible:ring-success/30"
                                />
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-success">
                                  <CheckCircle2Icon className="size-3.5" />
                                  Lengkap
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="px-3 py-3">
                              {remaining > 0 ? (
                                <QtyConfirmInput
                                  min={0}
                                  max={remaining - currentAccepted}
                                  expected={0}
                                  value={currentRejected === 0 ? "" : currentRejected}
                                  onChange={(v) =>
                                    handleRejectedChange(
                                      item.id,
                                      remaining,
                                      v === "" ? 0 : Number(v),
                                    )
                                  }
                                  onEnter={() => {
                                    if (canSubmit) handleSubmit();
                                  }}
                                  placeholder="0"
                                  className="h-9 w-20 tabular-nums border-destructive/40 bg-destructive/10 focus-visible:ring-destructive/30"
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                          {currentRejected > 0 && (
                            <TableRow className="border-b border-border/20 bg-destructive/[0.03]">
                              <TableCell colSpan={4} className="px-3 pb-3 pt-0">
                                <div className="flex items-center gap-2 pl-[52px]">
                                  <Label className="whitespace-nowrap text-xs font-medium text-destructive">
                                    Alasan tolak
                                  </Label>
                                  <Input
                                    value={row?.rejection_note ?? ""}
                                    onChange={(e) =>
                                      handleRejectionNoteChange(
                                        item.id,
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Mis. kemasan rusak, salah kirim, kadaluarsa..."
                                    className="h-8 flex-1 text-sm"
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })}
                    {items.length === 0 && !isFetchingItems && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          {debouncedSearch
                            ? `Tidak ada produk cocok "${debouncedSearch}".`
                            : "Belum ada produk."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {Object.keys(itemQtys).length > 0 && (
                  <div className="flex items-center justify-between border-t border-border/30 bg-muted/20 px-4 py-2.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Ringkasan Penerimaan
                    </span>
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        <span className="text-xs tabular-nums">
                          <span className="font-semibold text-success">
                            {totalAccepted}
                          </span>
                          <span className="ml-1 text-muted-foreground">
                            diterima
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-destructive" />
                        <span className="text-xs tabular-nums">
                          <span className="font-semibold text-destructive">
                            {totalRejected}
                          </span>
                          <span className="ml-1 text-muted-foreground">
                            ditolak
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {itemsMeta && (
                  <div className="px-4 py-3 border-t border-border/20">
                    <SimplePagination
                      page={itemsMeta.current_page}
                      lastPage={itemsMeta.last_page}
                      onPageChange={setPage}
                      perPage={perPage}
                      onPerPageChange={setPerPage}
                      isFetching={isFetchingItems}
                      total={itemsMeta.total}
                      label="produk"
                    />
                  </div>
                )}
              </div>
            </div>
          </LiquidGlass>

          <div className="flex items-center justify-end gap-3">
            <Link href="/dashboard/barang-masuk/pesanan">
              <Button variant="outline">
                <ArrowLeftIcon className="mr-1.5 size-4" />
                Batal
              </Button>
            </Link>
            <Button
              variant="primary"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {receiveMutation.isPending && (
                <Loader2Icon className="mr-1.5 size-4 animate-spin" />
              )}
              <PackageCheckIcon className="mr-1.5 size-4" />
              Simpan Penerimaan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
