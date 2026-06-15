"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TableInstance,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTablePagination } from "./data-table-pagination"
import type { FacetedFilter } from "./types"

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  getRowId?: (row: TData, index: number) => string

  searchColumnId?: string
  searchPlaceholder?: string

  searchValue?: string
  onSearchChange?: (value: string) => void
  facetedFilters?: FacetedFilter[]
  toolbarActions?: React.ReactNode
  columnLabels?: Record<string, string>
  hideToolbar?: boolean

  enableRowSelection?: boolean
  enableColumnVisibility?: boolean

  renderSubRow?: (row: TData, rowInstance: Row<TData>) => React.ReactNode

  bulkActions?: (
    selected: TData[],
    table: TableInstance<TData>
  ) => React.ReactNode
  onRowClick?: (row: TData) => void

  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean

  rowCount?: number
  sorting?: SortingState
  onSortingChange?: (s: SortingState) => void
  pagination?: PaginationState
  onPaginationChange?: (p: PaginationState) => void

  isLoading?: boolean

  loadingRows?: number
  emptyState?: React.ReactNode
  errorState?: React.ReactNode

  pageSizeOptions?: number[]
  hidePagination?: boolean
  className?: string

  tableContainerClassName?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  getRowId,
  searchColumnId,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  facetedFilters,
  toolbarActions,
  columnLabels,
  hideToolbar = false,
  enableRowSelection = false,
  enableColumnVisibility = true,
  renderSubRow,
  bulkActions,
  onRowClick,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  rowCount,
  sorting: sortingProp,
  onSortingChange,
  pagination: paginationProp,
  onPaginationChange,
  isLoading = false,
  loadingRows = 8,
  emptyState,
  errorState,
  pageSizeOptions,
  hidePagination = false,
  className,
  tableContainerClassName,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const sorting = sortingProp ?? internalSorting
  const pagination = paginationProp ?? internalPagination

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection,
    manualPagination,
    manualSorting,
    manualFiltering,
    rowCount: manualPagination ? rowCount : undefined,
    getRowCanExpand: renderSubRow ? () => true : undefined,
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(sorting) : updater
      setInternalSorting(next)
      onSortingChange?.(next)
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater
      setInternalPagination(next)
      onPaginationChange?.(next)
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((r) => r.original)
  const colSpan = table.getVisibleLeafColumns().length || columns.length

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {!hideToolbar && (
        <DataTableToolbar
          table={table}
          searchColumnId={searchColumnId}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          facetedFilters={facetedFilters}
          actions={toolbarActions}
          columnLabels={columnLabels}
          enableColumnVisibility={enableColumnVisibility}
        />
      )}

      {bulkActions && selectedRows.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-2.5 text-sm">
          <span className="font-medium">
            {selectedRows.length} dipilih
          </span>
          <div className="ml-auto flex items-center gap-2">
            {bulkActions(selectedRows, table)}
          </div>
        </div>
      )}

      <div
        className={cn(

          "overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl",
          tableContainerClassName
        )}
      >
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                  {table.getVisibleLeafColumns().map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton className="h-5 w-full max-w-[160px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : errorState ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="h-32 text-center">
                  {errorState}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {renderSubRow && row.getIsExpanded() && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={colSpan} className="bg-muted/20 p-0">
                        {renderSubRow(row.original, row)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="h-32 text-center">
                  {emptyState ?? (
                    <span className="text-muted-foreground">
                      Tidak ada data.
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!hidePagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          showSelectionCount={enableRowSelection}
        />
      )}
    </div>
  )
}
