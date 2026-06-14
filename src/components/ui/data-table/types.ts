import type * as React from "react"
import type { Column } from "@tanstack/react-table"

/** One selectable option in a faceted (multi-select) filter. */
export interface FacetedFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  /** Optional precomputed count shown as a trailing badge. */
  count?: number
}

/** Config for a single faceted filter rendered in the toolbar. */
export interface FacetedFilter {
  /** The table column id this filter targets. */
  columnId: string
  title: string
  options?: FacetedFilterOption[]
  /**
   * Custom control for this filter. When set, the toolbar renders this instead
   * of the default multi-select dropdown, passing the resolved column. Lets a
   * consumer swap in a richer filter (e.g. a nested-category dialog) without
   * changing the data-table core.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (column: Column<any, any>) => React.ReactNode
}
