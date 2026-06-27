"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import { ShieldIcon, DownloadIcon, XCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import {
  useReservedStocks,
  useCancelReservedStock,
} from "@/hooks/transaksi-stok/use-reserved-stocks"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { exportCsv } from "@/lib/export-csv"
import type {
  ReservedStock,
  ReservedStockListParams,
} from "@/types/transaksi-stok/reserved-stock"

interface FilterState {
  status: string
  location_id: string
}

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" }

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Aktif",
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

function TableSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border/40 px-3 py-3">
        <div className="flex gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border-b border-border/20 px-3 py-3.5">
          <div className="flex gap-4">
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function CadangTab() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [cancelTarget, setCancelTarget] = useState<ReservedStock | null>(null)

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

  const params = useMemo<ReservedStockListParams>(
    () => ({
      search: debouncedSearch || undefined,
      page,
      per_page: perPage,
      "filter[status]": filters.status || undefined,
      "filter[location_id]": filters.location_id || undefined,
    }),
    [debouncedSearch, page, perPage, filters]
  )

  const { data, isLoading, isFetching } = useReservedStocks(params)
  const { data: locData } = useLocations({ perPage: 100 })
  const cancelMut = useCancelReservedStock()

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

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "ACTIVE", label: "Aktif" },
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
      "stok-cadangan.csv",
      [
        "No. Cadangan",
        "Lokasi",
        "Tgl. Mulai",
        "Tgl. Selesai",
        "Status",
        "Dibuat Oleh",
      ],
      items.map((item: ReservedStock) => [
        item.reserved_stock_no,
        item.location?.location_name ?? "",
        formatDate(item.start_date),
        formatDate(item.end_date),
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
          searchPlaceholder="Cari no. cadangan..."
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

        <div className="px-4 py-3 sm:px-5">
          {isLoading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
              <ShieldIcon className="h-10 w-10" />
              <div className="text-center">
                <p className="text-sm font-medium">Belum ada stok cadangan</p>
                <p className="mt-1 text-xs">
                  Data stok cadangan akan muncul di sini.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      {[
                        "No. Cadangan",
                        "Lokasi",
                        "Tgl. Mulai",
                        "Tgl. Selesai",
                        "Status",
                        "Dibuat Oleh",
                        "Aksi",
                      ].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: ReservedStock) => {
                      const st = STATUS_MAP[item.status]
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40"
                        >
                          <td className="whitespace-nowrap px-3 py-3 font-medium">
                            <Link
                              href={`/dashboard/transaksi-stok/cadang/${item.id}`}
                              className="hover:text-primary hover:underline"
                            >
                              {item.reserved_stock_no}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                            {item.location?.location_name ?? "—"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                            {formatDate(item.start_date)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                            {formatDate(item.end_date)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] leading-tight",
                                st?.className
                              )}
                            >
                              {st?.label ?? item.status}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                            {item.created_by}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-right">
                            {item.status === "ACTIVE" && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setCancelTarget(item)}
                                aria-label="Batalkan"
                                className="text-destructive hover:text-destructive"
                              >
                                <XCircleIcon className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <SimplePagination
                page={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={setPage}
                perPage={meta.per_page}
                onPerPageChange={(s) => {
                  setPerPage(s)
                  resetPage()
                }}
                pageSizeOptions={[15, 30, 50]}
                total={meta.total}
                label="cadangan"
              />
            </div>
          )}
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(v) => !v && setCancelTarget(null)}
        title="Batalkan Stok Cadangan"
        description={`Apakah Anda yakin ingin membatalkan "${cancelTarget?.reserved_stock_no}"? Stok yang dicadangkan akan dikembalikan.`}
        confirmLabel="Batalkan"
        variant="destructive"
        loading={cancelMut.isPending}
        onConfirm={handleCancel}
      />
    </div>
  )
}
