"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"
import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import type { FacetedFilter } from "./types"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  /** Column id for the free-text search box. */
  searchColumnId?: string
  searchPlaceholder?: string
  /** Controlled global/search value (server mode). When set, overrides column filter. */
  searchValue?: string
  onSearchChange?: (value: string) => void
  facetedFilters?: FacetedFilter[]
  /** Right-aligned actions (e.g. Tambah, Import). */
  actions?: React.ReactNode
  columnLabels?: Record<string, string>
  enableColumnVisibility?: boolean
}

export function DataTableToolbar<TData>({
  table,
  searchColumnId,
  searchPlaceholder = "Cari…",
  searchValue,
  onSearchChange,
  facetedFilters,
  actions,
  columnLabels,
  enableColumnVisibility = true,
}: DataTableToolbarProps<TData>) {
  const isControlledSearch = onSearchChange !== undefined
  const column = searchColumnId ? table.getColumn(searchColumnId) : undefined

  const columnSearchValue = (column?.getFilterValue() as string) ?? ""
  const currentSearch = isControlledSearch
    ? searchValue ?? ""
    : columnSearchValue

  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    (isControlledSearch && (searchValue ?? "").length > 0)

  const resetFilters = () => {
    table.resetColumnFilters()
    onSearchChange?.("")
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {(searchColumnId || isControlledSearch) && (
          <div className="relative w-full max-w-xs sm:w-64">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={currentSearch}
              onChange={(e) => {
                if (isControlledSearch) onSearchChange?.(e.target.value)
                else column?.setFilterValue(e.target.value)
              }}
              className="h-9 rounded-full border-border bg-background pl-9 pr-8"
            />
            {currentSearch.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (isControlledSearch) onSearchChange?.("")
                  else column?.setFilterValue("")
                }}
                aria-label="Bersihkan pencarian"
                className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>
        )}

        {facetedFilters?.map((filter) => {
          const col = table.getColumn(filter.columnId)
          if (!col) return null
          if (filter.render) {
            return (
              <React.Fragment key={filter.columnId}>
                {filter.render(col)}
              </React.Fragment>
            )
          }
          return (
            <DataTableFacetedFilter
              key={filter.columnId}
              column={col}
              title={filter.title}
              options={filter.options ?? []}
            />
          )
        })}

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9 gap-1.5 rounded-full px-3"
          >
            Reset
            <XIcon className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        {enableColumnVisibility && (
          <DataTableViewOptions table={table} labels={columnLabels} />
        )}
      </div>
    </div>
  )
}
