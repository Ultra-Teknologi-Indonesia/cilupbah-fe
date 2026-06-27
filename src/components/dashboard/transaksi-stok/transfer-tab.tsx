"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import { ArrowLeftRightIcon, DownloadIcon, InfoIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { useQuery } from "@tanstack/react-query"
import { fetchClient } from "@/lib/api-client"
import { exportCsv } from "@/lib/export-csv"
import type {
  InventoryTransfer,
  InventoryTransferListParams,
} from "@/types/barang-masuk/inventory-transfer"
import type { ApiPaginated } from "@/types/api.types"

interface FilterState {
  status: string
}

const EMPTY_FILTERS: FilterState = { status: "" }

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  },
  APPROVED: {
    label: "Disetujui",
    className: "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  },
  IN_TRANSIT: {
    label: "Dalam Perjalanan",
    className: "border-amber-300 text-amber-600 dark:border-amber-500/30 dark:text-amber-400",
  },
  RECEIVED: {
    label: "Diterima",
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

function useInternalTransfers(params: InventoryTransferListParams = {}) {
  return useQuery({
    queryKey: ["internal-transfer", "list", params],
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (params.search) sp.set("search", params.search)
      if (params.page) sp.set("page", String(params.page))
      if (params.per_page) sp.set("per_page", String(params.per_page))
      if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
      if (params.sort) sp.set("sort", params.sort)

      const res = await fetchClient<ApiPaginated<InventoryTransfer>>(
        `/inventory/transfers?${sp}`
      )
      return { items: res.data ?? [], meta: res.meta }
    },
    staleTime: 30 * 1000,
  })
}

function TableSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border/40 px-3 py-3">
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border-b border-border/20 px-3 py-3.5">
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TransferTab() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

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

  const params = useMemo<InventoryTransferListParams>(
    () => ({
      search: debouncedSearch || undefined,
      page,
      per_page: perPage,
      "filter[status]": filters.status || undefined,
    }),
    [debouncedSearch, page, perPage, filters]
  )

  const { data, isLoading, isFetching } = useInternalTransfers(params)

  const items = data?.items ?? []
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
  }

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "DRAFT", label: "Draft" },
    { value: "APPROVED", label: "Disetujui" },
    { value: "IN_TRANSIT", label: "Dalam Perjalanan" },
    { value: "RECEIVED", label: "Diterima" },
    { value: "CANCELLED", label: "Dibatalkan" },
  ]

  const hasActiveFilter = Object.values(filters).some(Boolean)
  const activeCount = Object.values(filters).filter(Boolean).length

  const handleExport = useCallback(() => {
    if (items.length === 0) return
    exportCsv(
      "internal-transfer.csv",
      ["No. Transfer", "Asal", "Tujuan", "Status", "Tgl. Dibuat"],
      items.map((item: InventoryTransfer) => [
        item.transfer_number,
        item.source_location?.location_name ?? "",
        item.destination_location?.location_name ?? "",
        STATUS_MAP[item.status]?.label ?? item.status,
        formatDate(item.created_at),
      ])
    )
  }, [items])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-950/30 dark:text-blue-300">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Transfer internal mengelola pemindahan stok antar lokasi. Untuk
          membuat transfer baru, gunakan menu Barang Keluar.
        </p>
      </div>

      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari no. transfer..."
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
              <ArrowLeftRightIcon className="h-10 w-10" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  Belum ada internal transfer
                </p>
                <p className="mt-1 text-xs">
                  Data transfer internal akan muncul di sini.
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
                        "No. Transfer",
                        "Asal",
                        "Tujuan",
                        "Status",
                        "Tgl. Dibuat",
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
                    {items.map((item: InventoryTransfer) => {
                      const st = STATUS_MAP[item.status]
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40"
                        >
                          <td className="whitespace-nowrap px-3 py-3 font-medium">
                            <Link
                              href={`/dashboard/barang-keluar/transfer/${item.id}`}
                              className="hover:text-primary hover:underline"
                            >
                              {item.transfer_number}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                            {item.source_location?.location_name ?? "—"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                            {item.destination_location?.location_name ?? "—"}
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
                            {formatDate(item.created_at)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/dashboard/barang-keluar/transfer/${item.id}`}
                              >
                                Lihat
                              </Link>
                            </Button>
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
                label="transfer"
              />
            </div>
          )}
        </div>
      </LiquidGlass>
    </div>
  )
}
