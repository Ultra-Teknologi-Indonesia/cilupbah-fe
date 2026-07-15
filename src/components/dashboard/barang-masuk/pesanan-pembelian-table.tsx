"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PackageCheckIcon,
  PackagePlusIcon,
  PrinterIcon,
  ShoppingCartIcon,
} from "lucide-react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { useReceivablePurchaseOrders } from "@/hooks/barang-masuk/use-purchase-orders-inbound";
import { useReceiveAdditional } from "@/hooks/barang-masuk/use-inbound";
import type { PurchaseOrder } from "@/types/transaksi-pembelian/purchase-order";
import { formatDate } from "@/lib/format";

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} className="h-1.5 w-20" />
      <span className="text-xs tabular-nums text-muted-foreground">
        {value} / {total}
      </span>
    </div>
  );
}

function sumQty(po: PurchaseOrder, key: "qty" | "received_qty") {
  return po.items?.reduce((s, i) => s + (i[key] ?? 0), 0) ?? 0;
}

interface PesananPembelianTableProps {
  search: string;
  locationId: string;
  pagination: PaginationState;
  onPaginationChange: (updater: PaginationState) => void;
}

export function PesananPembelianTable({
  search,
  locationId,
  pagination,
  onPaginationChange,
}: PesananPembelianTableProps) {
  const router = useRouter();

  const params = useMemo(
    () => ({
      search: search || undefined,
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      "filter[location_id]": locationId || undefined,
      sort: "-order_date",
    }),
    [search, pagination.pageIndex, pagination.pageSize, locationId],
  );

  const { data, isLoading, isFetching } = useReceivablePurchaseOrders(params);
  const receiveAdditional = useReceiveAdditional();
  const items = data?.items ?? [];
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: pagination.pageSize,
    total: 0,
  };

  const columns = useMemo<ColumnDef<PurchaseOrder>[]>(
    () => [
      {
        accessorKey: "po_number",
        header: "No. Pesanan",
        cell: ({ row }) => (
          <Link href={`/dashboard/transaksi-pembelian/pesanan/${row.original.id}`} className="font-medium text-primary underline-offset-2 hover:underline">
            {row.original.po_number}
          </Link>
        ),
      },
      {
        id: "order_date",
        header: "Tgl. Pesanan",
        cell: ({ row }) => (
          <span>
            {row.original.order_date ? formatDate(row.original.order_date) : "—"}
          </span>
        ),
      },
      {
        id: "pemasok",
        header: "Pemasok",
        cell: ({ row }) => (
          <span>{row.original.contact?.name ?? "—"}</span>
        ),
      },
      {
        id: "location",
        header: "Lokasi",
        cell: ({ row }) => (
          <span>{row.original.location?.location_name ?? "—"}</span>
        ),
      },
      {
        id: "bill",
        header: "No. Tagihan",
        cell: ({ row }) => {
          const bills = row.original.bills ?? [];
          if (bills.length === 0) return <span>—</span>;
          return (
            <span className="tabular-nums">
              {bills.map((b) => b.bill_number).join(", ")}
            </span>
          );
        },
      },
      {
        id: "progress",
        header: "Progress",
        cell: ({ row }) => {
          const total = sumQty(row.original, "qty");
          const received = sumQty(row.original, "received_qty");
          return <ProgressBar value={received} total={total} />;
        },
      },
      {
        accessorKey: "notes",
        header: "Keterangan",
        cell: ({ row }) => <span>{row.original.notes ?? "—"}</span>,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => {
          const po = row.original;
          const received = sumQty(po, "received_qty");
          const total = sumQty(po, "qty");
          const isPartial = received > 0 && received < total;
          return (
            <div
              className="flex items-center justify-end gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="icon"
                variant="ghost"
                className="size-8"
                asChild
                aria-label="Pratinjau & cetak PO"
                title="Pratinjau & cetak Barang Masuk Pembelian"
              >
                <Link
                  href={`/dashboard/document-preview/purchase-order/${po.id}`}
                >
                  <PrinterIcon className="size-4" />
                </Link>
              </Button>
              {isPartial ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5"
                  disabled={receiveAdditional.isPending}
                  onClick={() => {
                    receiveAdditional.mutate(po.id, {
                      onSuccess: (created) => {
                        if (created?.id) {
                          router.push(
                            `/dashboard/barang-masuk/penerimaan/${created.id}`,
                          );
                        }
                      },
                    });
                  }}
                >
                  <PackagePlusIcon className="size-4" />
                  Terima Susulan
                </Button>
              ) : null}
              <Button size="sm" className="h-8 gap-1.5" asChild>
                <Link
                  href={`/dashboard/barang-masuk/penerimaan/tambah?po=${po.id}`}
                >
                  <PackageCheckIcon className="size-4" />
                  Terima
                </Link>
              </Button>
            </div>
          );
        },
      },
    ],
    [receiveAdditional, router],
  );

  return (
    <div className="px-5 py-5 sm:px-6">
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        isFetching={isFetching}
        hideToolbar
        manualPagination
        getRowId={(row) => row.id}

        pagination={pagination}
        rowCount={meta.total}
        onPaginationChange={onPaginationChange}
        tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
        emptyState={
          <EmptyState
            icon={ShoppingCartIcon}
            title="Belum ada pesanan pembelian menunggu penerimaan"
            description="Pesanan pembelian yang berstatus Sedang Berjalan atau Diterima Sebagian akan tampil di sini."
          />
        }
      />
    </div>
  );
}
