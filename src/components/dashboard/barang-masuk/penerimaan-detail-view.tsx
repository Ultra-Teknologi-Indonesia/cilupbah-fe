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
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { InfoField } from "@/components/dashboard/shared/info-field";
import { SortableHeader } from "@/components/dashboard/shared/sortable-header";
import { CopySku } from "@/components/dashboard/shared/copy-sku";
import {
  useInboundDetail,
  useInboundItems,
  useSetReceivedQty,
} from "@/hooks/barang-masuk/use-inbound";
import { exportCsv } from "@/lib/export-csv";
import type { Inbound, InboundItem } from "@/types/barang-masuk/inbound";

/**
 * Input jumlah diterima yang bisa diedit langsung (naik/turun).
 * Commit saat Enter/blur; Escape membatalkan. Tidak boleh di bawah qty yang
 * sudah ditempatkan (BE juga menolak sebagai backstop).
 */
function EditableReceivedQty({
  item,
  disabled,
  pending,
  onCommit,
}: {
  item: InboundItem;
  disabled: boolean;
  pending: boolean;
  onCommit: (itemId: string, qty: number) => void;
}) {
  const [val, setVal] = React.useState(String(item.received_qty));

  React.useEffect(() => {
    setVal(String(item.received_qty));
  }, [item.received_qty]);

  const commit = () => {
    const n = Number(val);
    if (
      !Number.isInteger(n) ||
      n < 0 ||
      n < item.putaway_qty ||
      n === item.received_qty
    ) {
      setVal(String(item.received_qty));
      return;
    }
    onCommit(item.id, n);
  };

  return (
    <Input
      type="number"
      inputMode="numeric"
      min={item.putaway_qty}
      value={val}
      disabled={disabled || pending}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          setVal(String(item.received_qty));
          e.currentTarget.blur();
        }
      }}
      aria-label="Edit jumlah diterima"
      className="ml-auto h-8 w-20 text-right tabular-nums"
    />
  );
}

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
    "Qty Ditolak",
    "Alasan Tolak",
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
    String(item.rejected_qty ?? 0),
    item.rejection_note ?? "",
    String(item.putaway_qty),
    String(item.discrepancy_qty),
    item.discrepancy_note ?? "",
  ]);
  exportCsv(`penerimaan-${inbound.transaction_number}.csv`, headers, rows);
}

export function PenerimaanDetailView({ id }: { id: string }) {
  const { data: inbound, isLoading } = useInboundDetail(id);
  const setReceivedMutation = useSetReceivedQty(id);

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

  const canEdit = !!inbound && inbound.status !== "CANCELLED";

  const handleReceivedCommit = (itemId: string, qty: number) =>
    setReceivedMutation.mutate({ itemId, qty });

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
                <ArrowLeftIcon className="mr-1.5 size-4" />
                Kembali
              </Button>
            </Link>
          </div>
        </LiquidGlass>
      ) : (
        <div className="flex flex-col gap-4 print:gap-2">
          <div className="flex items-center justify-end gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCsv(inbound)}
            >
              <DownloadIcon className="mr-1.5 size-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  `/dashboard/document-preview/inbound-barcodes/${inbound.id}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <QrCodeIcon className="mr-1.5 size-4" />
              Cetak Barcode
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  `/dashboard/document-preview/inbound-receipt/${inbound.id}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <PrinterIcon className="mr-1.5 size-4" />
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
                <InfoField
                  label="No. Penerimaan"
                  value={inbound.transaction_number}
                />
                <InfoField
                  label="No. Referensi"
                  value={inbound.reference_number}
                />
                <InfoField
                  label="Sumber"
                  value={TYPE_LABEL[inbound.type] ?? inbound.type}
                />
                <InfoField
                  label="Status"
                  value={
                    <StatusBadge
                      domain="inbound"
                      status={inbound.status}
                      className="text-2xs"
                    />
                  }
                />
                <InfoField
                  label="Lokasi"
                  value={inbound.location?.location_name}
                />
                <InfoField
                  label="Tgl. Diharapkan"
                  value={
                    inbound.expected_date
                      ? formatDate(inbound.expected_date)
                      : undefined
                  }
                />
                <InfoField label="Dibuat Oleh" value={inbound.created_by} />
                <InfoField
                  label="Dibuat"
                  value={formatDateTime(inbound.created_at)}
                />
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
                      Qty Ditolak
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
                        colSpan={9}
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
                        <TableCell className="px-3 py-2.5">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border bg-muted/50">
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
                          {canEdit ? (
                            <EditableReceivedQty
                              item={item}
                              disabled={!canEdit}
                              pending={setReceivedMutation.isPending}
                              onCommit={handleReceivedCommit}
                            />
                          ) : (
                            item.received_qty
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right tabular-nums">
                          {(item.rejected_qty ?? 0) > 0 ? (
                            <Badge
                              variant="outline"
                              className="border-destructive/30 text-2xs text-destructive"
                              title={item.rejection_note ?? undefined}
                            >
                              {item.rejected_qty}
                            </Badge>
                          ) : (
                            <span className="text-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right tabular-nums text-foreground">
                          {item.putaway_qty}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right tabular-nums">
                          {item.discrepancy_qty !== 0 ? (
                            <Badge
                              variant="outline"
                              className="border-destructive/30 text-2xs text-destructive"
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
                            className={cn("text-2xs", {
                              "border-border text-muted-foreground":
                                a.status === "PENDING",
                              "border-warning/30 text-warning":
                                a.status === "IN_PROGRESS",
                              "border-success/30 text-success":
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
