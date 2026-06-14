"use client"

import * as React from "react"

import type { FacetedFilter } from "@/components/ui/data-table"
import type { Product } from "../_data/mock-products"
import { PRODUCT_STATUS_OPTIONS } from "./product-status-badge"
import { ProductCategoryFilter } from "./product-category-filter"

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values))
    .sort()
    .map((value) => ({ value, label: value }))
}

/** Faceted filter config shared by the table and card views. */
export function useProductFacets(data: Product[]): FacetedFilter[] {
  return React.useMemo(
    () => [
      { columnId: "status", title: "Status", options: PRODUCT_STATUS_OPTIONS },
      {
        // Nested kategori → subkategori → jenis picker (dialog), not a flat list.
        columnId: "categoryName",
        title: "Kategori",
        render: (col) => <ProductCategoryFilter column={col} />,
      },
      {
        columnId: "brandName",
        title: "Merek",
        options: uniqueOptions(data.map((p) => p.brandName)),
      },
    ],
    [data]
  )
}
