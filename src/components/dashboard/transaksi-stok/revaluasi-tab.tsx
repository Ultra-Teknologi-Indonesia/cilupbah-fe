"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import { DollarSignIcon, DownloadIcon, XCircleIcon } from "lucide-react"

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
import {
  useStockRevaluations,
  useCancelStockRevaluation,
} from "@/hooks/transaksi-stok/use-stock-revaluations"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { exportCsv } from "@/lib/export-csv"
import type {
  StockRevaluation,
  StockRevaluationListParams,
} from "@/types/transaksi-stok/stock-revaluation"

interface FilterState {
  status: string
  location_id: string
}

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" }

const STATUS_MAP: Record<string, { label: string; className: string }> = {
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


export function RevaluasiTab() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [cancelTarget, setCancelTarget] = useState<StockRevaluation | null>(
    null
  )

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

  const params = useMemo<StockRevaluationListParams>(
    () => ({
      search: debouncedSearch || undefined,
      page,
      per_page: perPage,
      "filter[status]": filters.status || undefined,
      "filter[location_id]": filters.location_id || undefined,
    }),
    [debouncedSearch, page, perPage, filters]
  )

  const { data, isLoading, isFetching } = useStockRevaluations(params)
  const { data: locData } = useLocations({ perPage: 100 })
  const cancelMut = useCancelStockRevaluation()

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

    const columns = useMemo<ColumnDef<StockRevaluation>[]>(() => [
    {
      accessorKey: "revaluation_no",
      header: "No. Revaluasi",
      cell: ({ row }) => (
        <span className="font-medium">
          <Link
            href={`/dashboard/transaksi-stok/revaluasi/${row.original.id}`}
            className="hover:text-primary hover:underline"
          >
            {row.original.revaluation_no}
          </Link>
        </span>
      ),
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
      accessorKey: "approved_by",
      header: "Disetujui Oleh",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.approved_by ?? "—"}</span>,
    },
    {
      accessorKey: "approved_at",
      header: "Tgl. Disetujui",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.approved_at ? formatDate(row.original.approved_at) : "—"}</span>,
    },
  ], [])

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "APPROVED", label: "Approved" },
    { value: "CANCELLED", label: "Dibatalkan" },
  ]

  const hasActiveFilter = Object.values(filters).some(Boolean)
  const activeCount = Object.values(filters).filter(Boolean).length

  function handleCancel() {
    if (!cancelTarget) return
    cancelMut.mutate(cancelTarget.id, {
      onSuccess: () => setCancelTarget(null),
    })
  }

  const handleExport = useCallback(() => {
    if (items.length === 0) return
    exportCsv(
      "revaluasi-stok.csv",
      [
        "No. Revaluasi",
        "Lokasi",
        "Status",
        "Dibuat Oleh",
        "Disetujui Oleh",
        "Tgl. Disetujui",
      ],
      items.map((item: StockRevaluation) => [
        item.revaluation_no,
        item.location?.location_name ?? "",
        STATUS_MAP[item.status]?.label ?? item.status,
        item.created_by,
        item.approved_by ?? "—",
        item.approved_at ? formatDate(item.approved_at) : "—",
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
          searchPlaceholder="Cari no. revaluasi..."
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
                <DollarSignIcon className="h-10 w-10 opacity-20" />
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Belum ada revaluasi stok
                  </p>
                  <p className="mt-1 text-xs">
                    Data revaluasi stok akan muncul di sini.
                  </p>
                </div>
              </div>
            }
          />
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(v) => !v && setCancelTarget(null)}
        title="Batalkan Revaluasi Stok"
        description={`Apakah Anda yakin ingin membatalkan "${cancelTarget?.revaluation_no}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Batalkan"
        variant="destructive"
        loading={cancelMut.isPending}
        onConfirm={handleCancel}
      />
    </div>
  )
}
