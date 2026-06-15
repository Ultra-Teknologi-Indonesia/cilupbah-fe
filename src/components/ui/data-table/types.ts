import type * as React from "react"
import type { Column } from "@tanstack/react-table"

export interface FacetedFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>

  count?: number
}

export interface FacetedFilter {

  columnId: string
  title: string
  options?: FacetedFilterOption[]

  render?: (column: Column<any, any>) => React.ReactNode
}
