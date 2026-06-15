"use client"

import * as React from "react"
import {
  type RowSelectionState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { SearchXIcon } from "lucide-react"

import { DataTablePagination } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { productColumns } from "./product-columns"
import { ProductBulkActions } from "./product-bulk-actions"
import { ProductCard } from "./product-card"
import type { ProductListViewProps } from "./product-table"

/** Grid kartu produk — server-driven (instance manual, paginasi dari server). */
export function ProductCardView({
  items,
  total,
  isLoading,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
}: ProductListViewProps) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const table = useReactTable({
    data: items,
    columns: productColumns,
    getRowId: (p) => p.itemGroupId,
    state: { rowSelection, pagination, sorting },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: total,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (u) =>
      onPaginationChange(typeof u === "function" ? u(pagination) : u),
    onSortingChange: (u) =>
      onSortingChange(typeof u === "function" ? u(sorting) : u),
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    )
  }

  const rows = table.getRowModel().rows
  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((r) => r.original)

  return (
    <div className="flex flex-col gap-4">
      {selectedRows.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-2.5 text-sm">
          <span className="font-medium">{selectedRows.length} dipilih</span>
          <div className="ml-auto flex items-center gap-2">
            <ProductBulkActions selected={selectedRows} table={table} />
          </div>
        </div>
      )}

      {rows.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((row) => (
            <ProductCard
              key={row.id}
              product={row.original}
              selected={row.getIsSelected()}
              onSelectedChange={(v) => row.toggleSelected(v)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12">
          <SearchXIcon className="size-8 text-muted-foreground" />
          <p className="font-medium">Tidak ada produk</p>
          <p className="text-sm text-muted-foreground">
            Coba ubah pencarian atau filter.
          </p>
        </div>
      )}

      <DataTablePagination table={table} pageSizeOptions={[8, 12, 16, 24, 48]} />
    </div>
  )
}
