"use client"

import { SearchXIcon } from "lucide-react"

import { DataTable } from "@/components/ui/data-table"
import type { Product } from "../_data/mock-products"
import { productColumns, productColumnLabels } from "./product-columns"
import { ProductBulkActions } from "./product-bulk-actions"
import { ProductVariantDetail } from "./product-variant-detail"
import { useProductFacets } from "./product-facets"

// Table renderer for the master product list. Content-only: the surrounding
// Card + header (title, actions, view toggle) is provided by ProductExplorer.
export function ProductTable({ data }: { data: Product[] }) {
  const facetedFilters = useProductFacets(data)

  return (
    <DataTable
      columns={productColumns}
      data={data}
      getRowId={(p) => p.itemGroupId}
      searchColumnId="itemName"
      searchPlaceholder="Cari nama produk…"
      facetedFilters={facetedFilters}
      columnLabels={productColumnLabels}
      enableRowSelection
      renderSubRow={(product) => <ProductVariantDetail product={product} />}
      bulkActions={(selected, table) => (
        <ProductBulkActions selected={selected} table={table} />
      )}
      // Flatten the table frame — it already sits inside the explorer's Card —
      // and drop the tinted table-head background (scoped override, core untouched).
      tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
      emptyState={
        <div className="flex flex-col items-center gap-2 py-6">
          <SearchXIcon className="size-8 text-muted-foreground" />
          <p className="font-medium">Tidak ada produk yang cocok</p>
          <p className="text-sm text-muted-foreground">
            Coba ubah kata kunci pencarian atau filter.
          </p>
        </div>
      }
    />
  )
}
