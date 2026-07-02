"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { LucideIcon } from "lucide-react"
import { DownloadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { DataTable } from "@/components/ui/data-table/data-table"
import { FilterToolbar } from "@/components/dashboard/shared/filter-toolbar"
import type { useListState } from "@/hooks/use-list-state"

// Kerangka halaman/tab list standar: LiquidGlass + FilterToolbar + indikator
// refetch + DataTable berpaginasi server + empty state. Pengganti markup yang
// sebelumnya di-copy-paste ±150 baris per tab (AUDIT-FE.md §4.2). Yang tetap
// milik pemanggil: kolom, hook data, kontrol filter (children), dan dialog
// aksi baris. Contoh pemakaian: tab-tab transaksi-stok.

type ListState = ReturnType<typeof useListState<never>>

interface ResourceListViewProps<T> {
  /** Hasil useListState — dipakai untuk search & paginasi. */
  list: Pick<
    ListState,
    "search" | "setSearch" | "hasActiveFilter" | "activeFilterCount" | "pagination" | "onPaginationChange" | "resetFilters"
  >
  columns: ColumnDef<T>[]
  rows: T[]
  total: number
  isLoading: boolean
  isFetching: boolean
  searchPlaceholder: string
  /** Kontrol filter (Combobox dsb) di dalam FilterToolbar. */
  filterControls?: React.ReactNode
  filterGridCols?: 1 | 2 | 3 | 4
  /** Handler Export CSV; tombol otomatis disabled saat rows kosong. */
  onExport?: () => void
  /** Elemen tambahan di kiri toolbar (menggantikan/menambah tombol export). */
  toolbarLeading?: React.ReactNode
  emptyIcon: LucideIcon
  emptyTitle: string
  emptyDescription: string
}

export function ResourceListView<T>({
  list,
  columns,
  rows,
  total,
  isLoading,
  isFetching,
  searchPlaceholder,
  filterControls,
  filterGridCols = 2,
  onExport,
  toolbarLeading,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
}: ResourceListViewProps<T>) {
  return (
    <LiquidGlass
      radius={20}
      intensity="subtle"
      className="bg-white/30 dark:bg-white/[0.04]"
    >
      <FilterToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder={searchPlaceholder}
        align="end"
        onReset={list.hasActiveFilter ? list.resetFilters : undefined}
        hasFilter={list.hasActiveFilter}
        activeCount={list.activeFilterCount}
        gridCols={filterGridCols}
        leading={
          <>
            {toolbarLeading}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={rows.length === 0}
              >
                <DownloadIcon className="mr-1.5 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </>
        }
      >
        {filterControls}
      </FilterToolbar>

      {isFetching && !isLoading && (
        <div className="flex justify-center py-1">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      <div className="px-5 py-5 sm:px-6">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          hideToolbar
          manualPagination
          pagination={list.pagination}
          rowCount={total}
          onPaginationChange={list.onPaginationChange}
          tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
          emptyState={
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <EmptyIcon className="h-10 w-10 opacity-20" />
              <div className="text-center">
                <p className="text-sm font-medium">{emptyTitle}</p>
                <p className="mt-1 text-xs">{emptyDescription}</p>
              </div>
            </div>
          }
        />
      </div>
    </LiquidGlass>
  )
}
