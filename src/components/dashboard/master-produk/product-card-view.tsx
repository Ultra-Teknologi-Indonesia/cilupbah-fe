"use client"

import * as React from "react"
import {
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { SearchXIcon } from "lucide-react"

import {
  DataTablePagination,
  DataTableToolbar,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/types/master-produk"
import { productColumns } from "./product-columns"
import { ProductBulkActions } from "./product-bulk-actions"
import { ProductCard } from "./product-card"
import { useProductFacets } from "./product-facets"

export function ProductCardView({
  data,
  isLoading = false,
}: {
  data: Product[]
  isLoading?: boolean
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 12,
  })

  const facetedFilters = useProductFacets(data)

  const table = useReactTable({
    data,
    columns: productColumns,
    getRowId: (p) => p.itemGroupId,
    state: { sorting, columnFilters, rowSelection, pagination },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const rows = table.getRowModel().rows
  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((r) => r.original)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        searchColumnId="itemName"
        searchPlaceholder="Cari nama produk…"
        facetedFilters={facetedFilters}
        enableColumnVisibility={false}
      />

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
          <p className="font-medium">Tidak ada produk yang cocok</p>
          <p className="text-sm text-muted-foreground">
            Coba ubah kata kunci pencarian atau filter.
          </p>
        </div>
      )}

      <DataTablePagination
        table={table}
        pageSizeOptions={[8, 12, 16, 24, 48]}
      />
    </div>
  )
}
