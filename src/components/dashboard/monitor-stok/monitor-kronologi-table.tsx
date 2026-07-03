"use client";

import { useMemo } from "react";
import { PackageOpenIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import type { KronologiRow } from "@/types/monitor-stok/monitor";

interface PageMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface MonitorKronologiTableProps {
  rows: KronologiRow[];
  meta: PageMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (size: number) => void;
  emptyText?: string;
}

const CATEGORY_STYLE: Record<string, string> = {
  BILL: "bg-blue-100 text-blue-700 border-blue-200",
  ADJUSTMENT: "bg-amber-100 text-amber-700 border-amber-200",
  PURCHASE_RETURN: "bg-purple-100 text-purple-700 border-purple-200",
  SALES_RETURN: "bg-purple-100 text-purple-700 border-purple-200",
  PICKING: "bg-sky-100 text-sky-700 border-sky-200",
  PESANAN: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INVOICE: "bg-rose-100 text-rose-700 border-rose-200",
  TRANSFER: "bg-slate-100 text-slate-700 border-slate-200",
  REVALUATION: "bg-orange-100 text-orange-700 border-orange-200",
  OTHER: "bg-muted text-muted-foreground border-border/60",
};

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function QtyCell({ qty }: { qty: number }) {
  const positive = qty > 0;
  const zero = qty === 0;
  return (
    <span
      className={cn(
        "tabular-nums font-medium",
        zero
          ? "text-muted-foreground"
          : positive
            ? "text-emerald-600"
            : "text-rose-600",
      )}
    >
      {positive ? "+" : ""}
      {qty.toLocaleString("id-ID")}
    </span>
  );
}

export function MonitorKronologiTable({
  rows,
  meta,
  isLoading,
  onPageChange,
  onPerPageChange,
  emptyText,
}: MonitorKronologiTableProps) {
  const columns = useMemo<ColumnDef<KronologiRow>[]>(
    () => [
      {
        accessorKey: "transaction_date",
        header: "Tanggal",
        cell: ({ row }) => (
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {formatDate(row.original.transaction_date)}
          </span>
        ),
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.sku ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "location_name",
        header: "Lokasi",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.location_name ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "bin_code",
        header: "Rak",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.bin_code ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "source_label",
        header: "Jenis",
        cell: ({ row }) => {
          const r = row.original;
          const style =
            CATEGORY_STYLE[r.source_category] ?? CATEGORY_STYLE.OTHER;
          return (
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn("border text-[10px] font-medium", style)}
              >
                {r.source_label}
              </Badge>
              {r.is_variance && (
                <Badge
                  variant="outline"
                  className="border-rose-200 bg-rose-50 text-[10px] font-medium text-rose-700"
                >
                  Variance
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "qty",
        header: () => <span className="block text-right">Qty</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <QtyCell qty={row.original.qty} />
          </div>
        ),
      },
      {
        accessorKey: "balance",
        header: () => <span className="block text-right">Saldo</span>,
        cell: ({ row }) => (
          <div className="text-right text-sm tabular-nums">
            {row.original.balance.toLocaleString("id-ID")}
          </div>
        ),
      },
      {
        accessorKey: "transaction_number",
        header: "No. Transaksi",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.transaction_number ?? "—"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      hideToolbar
      manualPagination
      pagination={{
        pageIndex: meta.current_page - 1,
        pageSize: meta.per_page,
      }}
      rowCount={meta.total}
      onPaginationChange={(p) => {
        onPageChange(p.pageIndex + 1);
        onPerPageChange(p.pageSize);
      }}
      tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
      emptyState={
        <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
          <PackageOpenIcon className="h-10 w-10 opacity-20" />
          <p className="text-sm font-medium">
            {emptyText ?? "Belum ada pergerakan stok pada rentang ini."}
          </p>
        </div>
      }
    />
  );
}
