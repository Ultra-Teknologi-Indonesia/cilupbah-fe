"use client"

import * as React from "react"

import type { FacetedFilter } from "@/components/ui/data-table"
import type { Product } from "@/types/master-produk"
import { PRODUCT_STATUS_OPTIONS } from "@/lib/master-produk/constants"
import { ProductCategoryFilter } from "./product-category-filter"

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values))
    .sort()
    .map((value) => ({ value, label: value }))
}

export function useProductFacets(data: Product[]): FacetedFilter[] {
  return React.useMemo(
    () => [
      { columnId: "status", title: "Status", options: PRODUCT_STATUS_OPTIONS },
      {

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
