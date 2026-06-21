"use client"

import * as React from "react"
import type { PaginationState } from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  FileSpreadsheetIcon,
  ImportIcon,
  Loader2Icon,
  PackageIcon,
  RefreshCwIcon,
  SearchXIcon,
  XCircleIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { DataTable } from "@/components/ui/data-table"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { useImportBatches } from "@/hooks/master-produk/use-import"
import type {
  ImportBatch,
  ImportBatchState,
  ImportBatchType,
} from "@/services/master-produk/import.service"
import { ImportDialog } from "./import-dialog"
import { ImportErrorSheet } from "./import-error-sheet"

function stateLabel(state: ImportBatchState) {
  switch (state) {
    case "queued":
      return "Menunggu"
    case "processing":
      return "Diproses"
    case "done":
      return "Selesai"
    case "done_with_errors":
      return "Selesai (Error)"
    case "failed":
      return "Gagal"
  }
}

function StateIcon({ state }: { state: ImportBatchState }) {
  switch (state) {
    case "queued":
      return <ClockIcon className="size-4 text-muted-foreground" />
    case "processing":
      return <Loader2Icon className="size-4 animate-spin text-blue-500" />
    case "done":
      return <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
    case "done_with_errors":
      return <AlertTriangleIcon className="size-4 text-amber-500" />
    case "failed":
      return <XCircleIcon className="size-4 text-destructive" />
  }
}

function ProgressBar({ percent, state }: { percent: number; state: ImportBatchState }) {
  const color =
    state === "failed"
      ? "bg-destructive"
      : state === "done_with_errors"
        ? "bg-amber-500"
        : state === "done"
          ? "bg-emerald-500"
          : "bg-primary"
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <span className="tabular-nums text-xs text-muted-foreground">{percent}%</span>
    </div>
  )
}

function buildColumns(
  onViewErrors: (b: ImportBatch) => void
): ColumnDef<ImportBatch>[] {
  return [
    {
      accessorKey: "batchNo",
      header: "Batch",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-primary">{row.original.batchNo}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipe",
      size: 100,
      cell: ({ row }) => (
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
          {row.original.type === "single" ? "Satuan" : "Bundle"}
        </span>
      ),
    },
    {
      accessorKey: "originalFilename",
      header: "File",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileSpreadsheetIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="max-w-[200px] truncate">{row.original.originalFilename}</span>
        </div>
      ),
    },
    {
      accessorKey: "state",
      header: "Status",
      size: 150,
      cell: ({ row }) => {
        const b = row.original
        return (
          <div className="flex items-center gap-1.5">
            <StateIcon state={b.state} />
            <span className="text-sm">{stateLabel(b.state)}</span>
          </div>
        )
      },
    },
    {
      id: "progress",
      header: "Progress",
      size: 180,
      cell: ({ row }) => <ProgressBar percent={row.original.progressPercent} state={row.original.state} />,
    },
    {
      id: "rows",
      header: "Baris",
      size: 160,
      cell: ({ row }) => {
        const b = row.original
        if (b.state === "queued") return <span className="text-sm text-muted-foreground">—</span>
        return (
          <div className="flex gap-3 text-xs">
            <span className="text-muted-foreground">Total {b.totalRows}</span>
            {b.successRows > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400">
                {b.successRows} OK
              </span>
            )}
            {b.failedRows > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewErrors(b)
                }}
                className="font-medium text-destructive hover:underline"
              >
                {b.failedRows} gagal
              </button>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      size: 160,
      cell: ({ row }) => {
        const d = row.original.createdAt
        if (!d) return "—"
        const date = new Date(d)
        return (
          <span className="text-sm tabular-nums text-muted-foreground">
            {date.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}{" "}
            {date.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )
      },
    },
  ]
}

export function ImportView() {
  const [importType, setImportType] = React.useState<ImportBatchType | null>(null)
  const [errorBatch, setErrorBatch] = React.useState<ImportBatch | null>(null)

  const [typeFilter, setTypeFilter] = React.useState<"all" | ImportBatchType>("all")
  const [stateFilter, setStateFilter] = React.useState<"all" | ImportBatchState>("all")
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })

  const query = useImportBatches({
    type: typeFilter === "all" ? undefined : typeFilter,
    state: stateFilter === "all" ? undefined : stateFilter,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const items = query.data?.items ?? []
  const total = query.data?.meta?.total ?? 0
  const columns = React.useMemo(() => buildColumns(setErrorBatch), [])

  const hasFilter = typeFilter !== "all" || stateFilter !== "all"

  return (
    <>
      <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <ImportIcon className="size-5 text-primary" />
            <h2 className="font-semibold">Import Produk</h2>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="primary" size="sm" className="h-9 gap-2">
                  <ImportIcon className="size-4" />
                  Import Baru
                  <ChevronDownIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem
                  onSelect={() => setImportType("single")}
                  className="flex-col items-start gap-0.5"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <PackageIcon className="size-4" />
                    Import Produk Satuan
                  </span>
                  <span className="pl-6 text-xs text-muted-foreground">
                    Buat/update produk dari file Excel.
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setImportType("bundle")}
                  className="flex-col items-start gap-0.5"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <PackageIcon className="size-4" />
                    Import Produk Bundle
                  </span>
                  <span className="pl-6 text-xs text-muted-foreground">
                    Atur komposisi bundle dari file Excel.
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
              title="Muat ulang"
            >
              <RefreshCwIcon
                className={cn(
                  "size-4",
                  query.isFetching && "animate-spin motion-reduce:animate-none"
                )}
              />
              Refresh
            </Button>
          </div>
        </div>

        <FilterToolbar
          onReset={hasFilter ? () => {
            setTypeFilter("all")
            setStateFilter("all")
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          } : undefined}
          hasFilter={hasFilter}
          activeCount={(typeFilter !== "all" ? 1 : 0) + (stateFilter !== "all" ? 1 : 0)}
        >
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v as "all" | ImportBatchType)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
          >
            <SelectTrigger className="rounded-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="single">Satuan</SelectItem>
              <SelectItem value="bundle">Bundle</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={stateFilter}
            onValueChange={(v) => {
              setStateFilter(v as "all" | ImportBatchState)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
          >
            <SelectTrigger className="rounded-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="queued">Menunggu</SelectItem>
              <SelectItem value="processing">Diproses</SelectItem>
              <SelectItem value="done">Selesai</SelectItem>
              <SelectItem value="done_with_errors">Selesai (Error)</SelectItem>
              <SelectItem value="failed">Gagal</SelectItem>
            </SelectContent>
          </Select>
        </FilterToolbar>

        <div className="px-4 py-5 sm:px-5">
          {query.isError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertTriangleIcon className="size-8 text-destructive" />
              <p className="font-medium">Gagal memuat data import</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
              >
                Coba lagi
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={items}
              isLoading={query.isLoading}
              getRowId={(b) => b.id}
              hideToolbar
              manualPagination
              rowCount={total}
              pagination={pagination}
              onPaginationChange={setPagination}
              tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
              emptyState={
                <div className="flex flex-col items-center gap-2 py-6">
                  <SearchXIcon className="size-8 text-muted-foreground" />
                  <p className="font-medium">Belum ada riwayat import</p>
                  <p className="text-sm text-muted-foreground">
                    Mulai dari Import Baru → pilih Satuan atau Bundle.
                  </p>
                </div>
              }
            />
          )}
        </div>
      </LiquidGlass>

      {importType && (
        <ImportDialog
          type={importType}
          open={!!importType}
          onOpenChange={(o) => !o && setImportType(null)}
          onQueued={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
        />
      )}

      <ImportErrorSheet
        batch={errorBatch}
        open={!!errorBatch}
        onOpenChange={(o) => !o && setErrorBatch(null)}
      />
    </>
  )
}
