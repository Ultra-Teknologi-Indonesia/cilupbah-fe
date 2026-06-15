"use client"

import { SearchXIcon } from "lucide-react"
import type { PaginationState, SortingState } from "@tanstack/react-table"

import { DataTable } from "@/components/ui/data-table"
import type { Product } from "@/types/master-produk"
import { productColumns } from "./product-columns"
import { ProductBulkActions } from "./product-bulk-actions"
import { ProductVariantDetail } from "./product-variant-detail"

export interface ProductListViewProps {
  items: Product[]
  total: number
  isLoading: boolean
  sorting: SortingState
  onSortingChange: (s: SortingState) => void
  pagination: PaginationState
  onPaginationChange: (p: PaginationState) => void
}

/** Tabel produk — server-driven (paginasi/sort/filter di sisi server). */
export function ProductTable({
  items,
  total,
  isLoading,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
}: ProductListViewProps) {
  return (
    <DataTable
      columns={productColumns}
      data={items}
      isLoading={isLoading}
      getRowId={(p) => p.itemGroupId}
      hideToolbar
      manualPagination
      manualSorting
      rowCount={total}
      sorting={sorting}
      onSortingChange={onSortingChange}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      enableRowSelection
      renderSubRow={(product) => <ProductVariantDetail product={product} />}
      bulkActions={(selected, table) => (
        <ProductBulkActions selected={selected} table={table} />
      )}
      tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
      emptyState={
        <div className="flex flex-col items-center gap-2 py-6">
          <SearchXIcon className="size-8 text-muted-foreground" />
          <p className="font-medium">Tidak ada produk</p>
          <p className="text-sm text-muted-foreground">
            Coba ubah pencarian atau filter.
          </p>
        </div>
      }
    />
  )
}
