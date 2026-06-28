"use client"

import * as React from "react"
import { PackageOpenIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import type { MonitorStockRow } from "@/types/monitor-stok/monitor"

interface PageMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface MonitorStockTableProps {
  rows: MonitorStockRow[]
  meta: PageMeta
  isLoading: boolean
  isFetching: boolean
  locationLabel: string
  showRestock?: boolean
  emptyText?: string
  onPageChange: (page: number) => void
  onPerPageChange: (size: number) => void
}



function Thumb({ url, alt }: { url: string | null; alt: string }) {
  return (
    <div
      className="h-9 w-9 shrink-0 rounded-md border border-border/40 bg-muted/40 bg-cover bg-center"
      role="img"
      aria-label={alt}
      style={url ? { backgroundImage: `url(${url})` } : undefined}
    />
  )
}

export function MonitorStockTable({
  rows,
  meta,
  isLoading,
  isFetching,
  locationLabel,
  showRestock = false,
  emptyText = "Tidak ada produk pada kategori ini.",
  onPageChange,
  onPerPageChange,
}: MonitorStockTableProps) {
  const columns = React.useMemo<ColumnDef<MonitorStockRow>[]>(() => {
    const baseCols: ColumnDef<MonitorStockRow>[] = [
      {
        accessorKey: "product_name",
        header: "Produk",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Thumb url={row.original.thumbnail} alt={row.original.product_name ?? row.original.sku} />
            <div className="min-w-0">
              <p className="truncate font-medium" title={row.original.product_name ?? ""}>
                {row.original.product_name ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">{row.original.sku}</p>
              {row.original.variation_values.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {row.original.variation_values.map((v, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px] font-normal">
                      {v.value}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        id: "location",
        header: () => <div className="text-right">Lokasi</div>,
        cell: () => <div className="text-right text-muted-foreground">{locationLabel}</div>,
      },
      {
        accessorKey: "on_hand",
        header: () => <div className="text-right">On Hand</div>,
        cell: ({ row }) => <div className="text-right tabular-nums">{row.original.on_hand}</div>,
      },
      {
        accessorKey: "on_order",
        header: () => <div className="text-right">On Order</div>,
        cell: ({ row }) => <div className="text-right tabular-nums">{row.original.on_order}</div>,
      },
      {
        accessorKey: "available",
        header: () => <div className="text-right">Tersedia</div>,
        cell: ({ row }) => (
          <div className={cn("text-right tabular-nums font-medium", row.original.available <= 0 ? "text-red-600 dark:text-red-400" : "")}>
            {row.original.available}
          </div>
        ),
      },
    ];

    if (showRestock) {
      baseCols.push({
        accessorKey: "qty_to_restock",
        header: () => <div className="text-right">Perlu Restock</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums font-semibold text-amber-600 dark:text-amber-400">
            {row.original.qty_to_restock}
          </div>
        ),
      });
    }

    return baseCols;
  }, [locationLabel, showRestock]);

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
        onPageChange(p.pageIndex + 1)
        onPerPageChange(p.pageSize)
      }}
      tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
      emptyState={
        <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
          <PackageOpenIcon className="h-10 w-10 opacity-20" />
          <p className="text-sm font-medium">{emptyText}</p>
        </div>
      }
    />
  )
}
