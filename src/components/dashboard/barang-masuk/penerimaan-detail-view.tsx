"use client";

import * as React from "react";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  ArrowLeftIcon,
  ImageIcon,
  Loader2Icon,
  PrinterIcon,
  DownloadIcon,
  QrCodeIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Skeleton } from "@/components/ui/skeleton";
import { SimplePagination } from "@/components/ui/simple-pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { PageTitle } from "@/components/dashboard/page-title";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { SortableHeader } from "@/components/dashboard/shared/sortable-header";
import { CopySku } from "@/components/dashboard/shared/copy-sku";
import {
  useInboundDetail,
  useInboundItems,
  useCorrectReceivedLines,
} from "@/hooks/barang-masuk/use-inbound";
import { exportCsv } from "@/lib/export-csv";
import type { Inbound, InboundItem } from "@/types/barang-masuk/inbound";

const TYPE_LABEL: Record<string, string> = {
  PURCHASE_ORDER: "Pesanan Pembelian",
  TRANSIT_IN: "Transfer Masuk",
  SALES_RETURN: "Retur",
  CONSIGNMENT: "Konsinyasi",
};

function handleExportCsv(inbound: Inbound) {
  const headers = [
    "SKU",
    "Produk",
    "Qty Diharapkan",
    "Qty Diterima",
    "Qty Putaway",
    "Selisih",
    "Catatan Selisih",
  ];
  const rows = inbound.items.map((item) => [
    item.variant?.sku ?? "",
    item.variant?.product?.name ??
      item.variant?.item_name ??
      item.variant?.name ??
      "",
    String(item.expected_qty),
    String(item.received_qty),
    String(item.putaway_qty),
    String(item.discrepancy_qty),
    item.discrepancy_note ?? "",
  ]);
  exportCsv(`penerimaan-${inbound.transaction_number}.csv`, headers, rows);
}

function isCorrectable(item: InboundItem): boolean {
  return item.received_qty - item.putaway_qty > 0;
}

export function PenerimaanDetailView({ id }: { id: string }) {
  const { data: inbound, isLoading } = useInboundDetail(id);
  const correctMutation = useCorrectReceivedLines(id);

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [sort, setSort] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: itemsRes, isFetching: isFetchingItems } = useInboundItems(id, {
    page,
    perPage,
    search: debouncedSearch || undefined,
    sort,
  });
  const items: InboundItem[] = itemsRes?.data ?? [];
  const itemsMeta = itemsRes?.meta;

  const handleSort = (next: string | undefined) => {
    setSort(next);
    setPage(1);
  };

  const canCorrect = !!inbound && inbound.status !== "CANCELLED";
  const correctableItems = React.useMemo(
    () => items.filter(isCorrectable),
    [items],
  );

  const toggleOne = (itemId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });

  const allCorrectableSelected =
    correctableItems.length > 0 &&
    correctableItems.every((i) => selected.has(i.id));

  const toggleAll = () =>
    setSelected(
      allCorrectableSelected
        ? new Set()
        : new Set(correctableItems.map((i) => i.id)),
    );

  const submitCorrection = () => {
    correctMutation.mutate(
      Array.from(selected).map((item_id) => ({ item_id })),
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setSelected(new Set());
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Detail Penerimaan"
        description={inbound ? inbound.transaction_number : "Memuat..."}
        backHref="/dashboard/barang-masuk"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Barang Masuk", href: "/dashboard/barang-masuk" },
          { label: "Detail Penerimaan" },
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
            <Skeleton className="h-40 w-full" />
          </div>
        </LiquidGlass>
      ) : !inbound ? (
        <LiquidGlass
          radius={20}
          intensity="subtle"
          className="bg-white/30 p-6 dark:bg-white/[0.04]"
        >
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <p className="text-sm font-medium">Penerimaan tidak ditemukan</p>
            <Link href="/dashboard/barang-masuk">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>
        </LiquidGlass>
      ) : (
        <div className="flex flex-col gap-4 print:gap-2">
          <div className="flex items-center justify-end gap-2 print:hidden">
            {canCorrect && selected.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmOpen(true)}
                disabled={correctMutation.isPending}
              >
                {correctMutation.isPending ? (
                  <Loader2Icon className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2Icon className="mr-1.5 h-4 w-4" />
                )}
                Koreksi Terpilih ({selected.size})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCsv(inbound)}
            >
              <DownloadIcon className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  `/api/app/inbounds/${inbound.id}/barcodes`,
                  "_blank",
                )
              }
            >
              <QrCodeIcon className="mr-1.5 h-4 w-4" />
              Cetak Barcode
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <PrinterIcon className="mr-1.5 h-4 w-4" />
              Cetak
            </Button>
          </div>

          <LiquidGlass
            radius={20}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04] print:border print:border-border print:shadow-none"
          >
            <div className="px-5 py-4">
              <h3 className="mb-3 text-sm font-semibold print:text-base">
                Informasi Penerimaan
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    No. Penerimaan
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {inbound.transaction_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    No. Referensi
                  </p>
                  <p className="mt-1 text-sm">
                    {inbound.reference_number ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Sumber
                  </p>
                  <p className="mt-1 text-sm">
                    {TYPE_LABEL[inbound.type] ?? inbound.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </p>
                  <StatusBadge
                    domain="inbound"
                    status={inbound.status}
                    className="mt-1 text-[10px]"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Lokasi
                  </p>
                  <p className="mt-1 text-sm">
                    {inbound.location?.location_name ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Tgl. Diharapkan
                  </p>
                  <p className="mt-1 text-sm">
                    {inbound.expected_date
                      ? formatDate(inbound.expected_date)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Dibuat Oleh
                  </p>
                  <p className="mt-1 text-sm">{inbound.created_by}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Dibuat
                  </p>
                  <p className="mt-1 text-sm">
                    {formatDateTime(inbound.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass
            radius={20}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04] print:border print:border-border print:shadow-none"
          >
            <div className="px-5 py-4">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                <h3 className="text-sm font-semibold print:text-base">
                  Daftar Item
                </h3>
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
              <h3 className="mb-3 hidden text-sm font-semibold print:block print:text-base">
                Daftar Item
              </h3>
              <Table containerClassName="rounded-lg border border-border/40">
                <TableHeader>
                  <TableRow className="border-b border-border/60 bg-muted/30">
                    {canCorrect && correctableItems.length > 0 && (
                      <TableHead className="w-10 px-3 py-2.5 print:hidden">
                        <Checkbox
                          checked={allCorrectableSelected}
                          onCheckedChange={toggleAll}
                          aria-label="Pilih semua item yang bisa dikoreksi"
                        />
                      </TableHead>
                    )}
                    <TableHead className="w-12 whitespace-nowrap px-3 py-2.5 text-muted-foreground"></TableHead>
                    <TableHead className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <SortableHeader
                        label="Produk"
                        field="sku"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <SortableHeader
                        label="Qty Diharapkan"
                        field="expected_qty"
                        currentSort={sort}
                        onSort={handleSort}
                        align="right"
                        className="w-full"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <SortableHeader
                        label="Qty Diterima"
                        field="received_qty"
                        currentSort={sort}
                        onSort={handleSort}
                        align="right"
                        className="w-full"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <SortableHeader
                        label="Qty Putaway"
                        field="putaway_qty"
                        currentSort={sort}
                        onSort={handleSort}
                        align="right"
                        className="w-full"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Selisih
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Catatan
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 && !isFetchingItems && (
                    <TableRow>
                      <TableCell
                        colSpan={
                          canCorrect && correctableItems.length > 0 ? 9 : 8
                        }
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        {debouncedSearch
                          ? `Tidak ada item cocok "${debouncedSearch}".`
                          : "Belum ada item."}
                      </TableCell>
                    </TableRow>
                  )}
                  {items.map((item: InboundItem) => {
                    const variantOptions = item.variant?.options
                      ?.map((o) => o.value)
                      .filter(Boolean)
                      .join(", ");
                    const productName =
                      item.variant?.product?.name ??
                      item.variant?.item_name ??
                      item.variant?.name ??
                      "—";
                    const imageUrl =
                      item.variant?.media?.[0]?.url ??
                      item.variant?.product?.media?.[0]?.url;
                    return (
                      <TableRow
                        key={item.id}
                        className="border-b border-border/20 last:border-0"
                      >
                        {canCorrect && correctableItems.length > 0 && (
                          <TableCell className="px-3 py-2.5 print:hidden">
                            {isCorrectable(item) ? (
                              <Checkbox
                                checked={selected.has(item.id)}
                                onCheckedChange={() => toggleOne(item.id)}
                                aria-label="Pilih item"
                              />
                            ) : null}
                          </TableCell>
                        )}
                        <TableCell className="px-3 py-2.5">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted/50">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                <ImageIcon className="h-4 w-4 opacity-50" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-2.5">
                          <div
                            className="flex min-w-0 flex-col gap-0.5"
                            style={{ maxWidth: 320 }}
                          >
                            <span className="font-medium whitespace-normal break-words text-foreground">
                              {productName}
                            </span>
                            {variantOptions && (
                              <span className="whitespace-normal break-words text-xs text-foreground">
                                {variantOptions}
                              </span>
                            )}
                            {item.variant?.sku && (
                              <CopySku sku={item.variant.sku} />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right tabular-nums text-foreground">
                          {item.expected_qty}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right tabular-nums text-foreground">
                          {item.received_qty}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right tabular-nums text-foreground">
                          {item.putaway_qty}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right tabular-nums">
                          {item.discrepancy_qty !== 0 ? (
                            <Badge
                              variant="outline"
                              className="border-red-300 text-[10px] text-red-600"
                            >
                              {item.discrepancy_qty > 0 ? "+" : ""}
                              {item.discrepancy_qty}
                            </Badge>
                          ) : (
                            <span className="text-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate whitespace-normal px-3 py-2.5 text-xs text-foreground">
                          {item.discrepancy_note ?? "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {itemsMeta && (
                <div className="mt-3 print:hidden">
                  <SimplePagination
                    page={itemsMeta.current_page}
                    lastPage={itemsMeta.last_page}
                    onPageChange={setPage}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                    isFetching={isFetchingItems}
                    total={itemsMeta.total}
                    label="item"
                  />
                </div>
              )}
            </div>
          </LiquidGlass>

          {inbound.assignments && inbound.assignments.length > 0 && (
            <LiquidGlass
              radius={20}
              intensity="subtle"
              className="bg-white/30 dark:bg-white/[0.04] print:border print:border-border print:shadow-none"
            >
              <div className="px-5 py-4">
                <h3 className="mb-3 text-sm font-semibold print:text-base">
                  Riwayat Assignment
                </h3>
                <Table containerClassName="rounded-lg border border-border/40">
                  <TableHeader>
                    <TableRow className="border-b border-border/60 bg-muted/30">
                      {[
                        "Petugas",
                        "Ditugaskan Oleh",
                        "Status",
                        "Mulai",
                        "Selesai",
                        "Catatan",
                      ].map((h) => (
                        <TableHead
                          key={h}
                          className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inbound.assignments.map((a) => (
                      <TableRow
                        key={a.id}
                        className="border-b border-border/20 last:border-0"
                      >
                        <TableCell className="px-3 py-2.5">
                          {a.worker?.name ?? a.assigned_to}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-muted-foreground">
                          {a.assigner?.name ?? a.assigned_by}
                        </TableCell>
                        <TableCell className="px-3 py-2.5">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px]", {
                              "border-slate-300 text-slate-600":
                                a.status === "PENDING",
                              "border-amber-300 text-amber-600":
                                a.status === "IN_PROGRESS",
                              "border-emerald-300 text-emerald-600":
                                a.status === "COMPLETED",
                            })}
                          >
                            {a.status === "PENDING"
                              ? "Menunggu"
                              : a.status === "IN_PROGRESS"
                                ? "Dikerjakan"
                                : "Selesai"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-muted-foreground">
                          {a.started_at ? formatDateTime(a.started_at) : "—"}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-muted-foreground">
                          {a.completed_at ? formatDateTime(a.completed_at) : "—"}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate whitespace-normal px-3 py-2.5 text-xs text-muted-foreground">
                          {a.notes ?? ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </LiquidGlass>
          )}

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Koreksi Penerimaan</DialogTitle>
                <DialogDescription>
                  Koreksi {selected.size} item terpilih? Qty diterima akan
                  dikurangi dan stok dikembalikan (dihapus) dari bin inbound.
                  Hanya qty yang belum di-putaway yang bisa dikoreksi.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={() => setConfirmOpen(false)}
                  disabled={correctMutation.isPending}
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={submitCorrection}
                  disabled={correctMutation.isPending}
                >
                  {correctMutation.isPending ? "Mengoreksi…" : "Ya, Koreksi"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
