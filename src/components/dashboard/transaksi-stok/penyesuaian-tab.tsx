"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import {
  SlidersHorizontalIcon,
  DownloadIcon,
  CheckCircleIcon,
  Trash2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { Input } from "@/components/ui/input"
import {
  useStockAdjustments,
  useApproveStockAdjustment,
  useDeleteStockAdjustment,
} from "@/hooks/transaksi-stok/use-stock-adjustments"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { exportCsv } from "@/lib/export-csv"
import type {
  StockAdjustment,
  StockAdjustmentListParams,
} from "@/types/transaksi-stok/stock-adjustment"

interface FilterState {
  status: string
  location_id: string
}

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" }

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  },
  APPROVED: {
    label: "Approved",
    className: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
  },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}


export function PenyesuaianTab() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [deleteTarget, setDeleteTarget] = useState<StockAdjustment | null>(null)
  const [approveTarget, setApproveTarget] = useState<StockAdjustment | null>(null)
  const [approvedBy, setApprovedBy] = useState("")

  const resetPage = useCallback(() => setPage(1), [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      resetPage()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, resetPage])

  const handleFilterChange = useCallback(
    (f: FilterState) => {
      setFilters(f)
      resetPage()
    },
    [resetPage]
  )

  const params = useMemo<StockAdjustmentListParams>(
    () => ({
      search: debouncedSearch || undefined,
      page,
      per_page: perPage,
      "filter[status]": filters.status || undefined,
      "filter[location_id]": filters.location_id || undefined,
    }),
    [debouncedSearch, page, perPage, filters]
  )

  const { data, isLoading, isFetching } = useStockAdjustments(params)
  const { data: locData } = useLocations({ perPage: 100 })
  const approveMut = useApproveStockAdjustment()
  const deleteMut = useDeleteStockAdjustment()

  const items = data?.items ?? []
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
  }

  const locationOptions = useMemo(
    () => [
      { value: "", label: "Semua Lokasi" },
      ...(locData?.items ?? []).map((l) => ({
        value: l.id,
        label: l.locationName,
      })),
    ],
    [locData]
  )

    const columns = useMemo<ColumnDef<StockAdjustment>[]>(() => [
    {
      accessorKey: "adjustment_no",
      header: "No. Penyesuaian",
      cell: ({ row }) => (
        <span className="font-medium">
          <Link
            href={`/dashboard/transaksi-stok/penyesuaian/${row.original.id}`}
            className="hover:text-primary hover:underline"
          >
            {row.original.adjustment_no}
          </Link>
        </span>
      ),
    },
    {
      accessorKey: "transaction_date",
      header: "Tgl. Transaksi",
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.transaction_date)}</span>,
    },
    {
      id: "location",
      header: "Lokasi",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.location?.location_name ?? "—"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = STATUS_MAP[row.original.status]
        return (
          <Badge
            variant="outline"
            className={cn("text-[10px] leading-tight", st?.className)}
          >
            {st?.label ?? row.original.status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_by",
      header: "Dibuat Oleh",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.created_by}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const item = row.original;
        if (item.status === "DRAFT") {
          return (
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setApproveTarget(item)}
                aria-label="Approve"
                className="text-emerald-600 hover:text-emerald-700"
              >
                <CheckCircleIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleteTarget(item)}
                aria-label="Hapus"
                className="text-destructive hover:text-destructive"
              >
                <Trash2Icon className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        }
        return null;
      },
    },
  ], [])

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "DRAFT", label: "Draft" },
    { value: "APPROVED", label: "Approved" },
    { value: "CANCELLED", label: "Dibatalkan" },
  ]

  const hasActiveFilter = Object.values(filters).some(Boolean)
  const activeCount = Object.values(filters).filter(Boolean).length

  function handleDelete() {
    if (!deleteTarget) return
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  function handleApprove() {
    if (!approveTarget || !approvedBy.trim()) return
    approveMut.mutate(
      { id: approveTarget.id, approvedBy: approvedBy.trim() },
      {
        onSuccess: () => {
          setApproveTarget(null)
          setApprovedBy("")
        },
      }
    )
  }

  const handleExport = useCallback(() => {
    if (items.length === 0) return
    exportCsv(
      "penyesuaian-stok.csv",
      [
        "No. Penyesuaian",
        "Tgl. Transaksi",
        "Lokasi",
        "Status",
        "Dibuat Oleh",
      ],
      items.map((item: StockAdjustment) => [
        item.adjustment_no,
        formatDate(item.transaction_date),
        item.location?.location_name ?? "",
        STATUS_MAP[item.status]?.label ?? item.status,
        item.created_by,
      ])
    )
  }, [items])

  return (
    <div className="flex flex-col gap-4">
      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari no. penyesuaian..."
          align="end"
          onReset={
            hasActiveFilter
              ? () => handleFilterChange(EMPTY_FILTERS)
              : undefined
          }
          hasFilter={hasActiveFilter}
          activeCount={activeCount}
          gridCols={2}
          leading={
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={items.length === 0}
            >
              <DownloadIcon className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
          }
        >
          <Combobox
            options={statusOptions}
            value={filters.status}
            onChange={(v) =>
              handleFilterChange({ ...filters, status: v ?? "" })
            }
            placeholder="Status"
            searchPlaceholder="Cari status"
            className="h-9 bg-background"
          />
          <Combobox
            options={locationOptions}
            value={filters.location_id}
            onChange={(v) =>
              handleFilterChange({ ...filters, location_id: v ?? "" })
            }
            placeholder="Lokasi"
            searchPlaceholder="Cari lokasi"
            className="h-9 bg-background"
          />
        </FilterToolbar>

        {isFetching && !isLoading && (
          <div className="flex justify-center py-1">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

                <div className="px-5 py-5 sm:px-6">
          <DataTable
            columns={columns}
            data={items}
            isLoading={isLoading}
            hideToolbar
            manualPagination
            pagination={{
              pageIndex: page - 1,
              pageSize: perPage,
            }}
            rowCount={meta.total}
            onPaginationChange={(p) => {
              setPage(p.pageIndex + 1)
              setPerPage(p.pageSize)
            }}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                <SlidersHorizontalIcon className="h-10 w-10 opacity-20" />
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Belum ada penyesuaian stok
                  </p>
                  <p className="mt-1 text-xs">
                    Data penyesuaian stok akan muncul di sini.
                  </p>
                </div>
              </div>
            }
          />
        </div>
      </LiquidGlass>

      {/* Approve dialog */}
      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(v) => {
          if (!v) {
            setApproveTarget(null)
            setApprovedBy("")
          }
        }}
        title="Setujui Penyesuaian Stok"
        description={`Setujui penyesuaian "${approveTarget?.adjustment_no}"?`}
        confirmLabel="Setujui"
        variant="default"
        loading={approveMut.isPending}
        onConfirm={handleApprove}
      >
        <div className="flex flex-col gap-2 pt-2">
          <label className="text-sm font-medium">Disetujui oleh</label>
          <Input
            value={approvedBy}
            onChange={(e) => setApprovedBy(e.target.value)}
            placeholder="Nama penyetuju"
          />
        </div>
      </ConfirmDialog>

      {/* Delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Hapus Penyesuaian Stok"
        description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.adjustment_no}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
