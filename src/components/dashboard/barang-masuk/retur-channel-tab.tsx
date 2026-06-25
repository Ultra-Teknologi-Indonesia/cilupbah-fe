"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { CornerDownLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { useSalesReturnsUnprocessed, useSalesReturns } from "@/hooks/barang-masuk/use-sales-returns"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import type { SalesReturn, SalesReturnStatus } from "@/types/barang-masuk/sales-return"

type ReturSubTab = "unprocessed" | "rejected" | "accepted" | "completed"

const SUB_TABS: { key: ReturSubTab; label: string }[] = [
  { key: "unprocessed", label: "Barang Retur" },
  { key: "rejected", label: "Ditolak" },
  { key: "accepted", label: "Disetujui" },
  { key: "completed", label: "Selesai" },
]

const STATUS_STYLE: Record<string, string> = {
  PENDING: "border-amber-300 text-amber-600 dark:border-amber-500/30 dark:text-amber-400",
  ACCEPTED: "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  REJECTED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
  COMPLETED: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  ACCEPTED: "Disetujui",
  REJECTED: "Ditolak",
  COMPLETED: "Selesai",
}

const SUBTAB_TO_STATUS: Record<ReturSubTab, string> = {
  unprocessed: "",
  rejected: "REJECTED",
  accepted: "ACCEPTED",
  completed: "COMPLETED",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
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
      {Array.from({ length: 6 }).map((_, i) => (
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

interface FilterState {
  location_id: string
}

const EMPTY_FILTERS: FilterState = { location_id: "" }

export function ReturChannelTab() {
  const [subTab, setSubTab] = useState<ReturSubTab>("unprocessed")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  const resetPage = useCallback(() => setPage(1), [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      resetPage()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, resetPage])

  const handleFilterChange = useCallback((f: FilterState) => {
    setFilters(f)
    resetPage()
  }, [resetPage])

  const handleSubTabChange = useCallback((t: ReturSubTab) => {
    setSubTab(t)
    setPage(1)
  }, [])

  const isUnprocessed = subTab === "unprocessed"
  const statusFilter = SUBTAB_TO_STATUS[subTab]

  const params = useMemo(() => ({
    search: debouncedSearch || undefined,
    page,
    per_page: perPage,
    "filter[status]": statusFilter || undefined,
    "filter[location_id]": filters.location_id || undefined,
  }), [debouncedSearch, page, perPage, statusFilter, filters])

  const unprocessedQuery = useSalesReturnsUnprocessed(isUnprocessed ? params : {})
  const listQuery = useSalesReturns(!isUnprocessed ? params : {})

  const activeQuery = isUnprocessed ? unprocessedQuery : listQuery
  const { data, isLoading, isFetching } = activeQuery
  const { data: locData } = useLocations({ perPage: 100 })

  const items = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

  const locationOptions = useMemo(() => [
    { value: "", label: "Semua Lokasi" },
    ...(locData?.items ?? []).map((l) => ({ value: l.id, label: l.locationName })),
  ], [locData])

  const hasActiveFilter = Object.values(filters).some(Boolean)
  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {SUB_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSubTabChange(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              subTab === key
                ? "bg-foreground/10 text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari no. retur, pelanggan..."
          align="end"
          onReset={hasActiveFilter ? () => handleFilterChange(EMPTY_FILTERS) : undefined}
          hasFilter={hasActiveFilter}
          activeCount={activeCount}
          gridCols={2}
        >
          <Combobox
            options={locationOptions}
            value={filters.location_id}
            onChange={(v) => handleFilterChange({ ...filters, location_id: v ?? "" })}
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
              <CornerDownLeftIcon className="h-10 w-10" />
              <div className="text-center">
                <p className="text-sm font-medium">Belum ada retur</p>
                <p className="mt-1 text-xs">Retur dari channel online akan tampil di sini.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      {["No. Retur", "Sumber", "Pelanggan", "Alasan", "Lokasi", "Qty", "Tgl. Retur", "Status"].map((h) => (
                        <th key={h} className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: SalesReturn) => {
                      const totalQty = item.items?.reduce((s, i) => s + i.qty, 0) ?? 0
                      return (
                        <tr key={item.id} className="border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40">
                          <td className="whitespace-nowrap px-3 py-3 font-medium">
                            {item.return_number}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <Badge variant="outline" className="text-[10px] leading-tight">
                              {item.source === "marketplace" ? "Marketplace" : "Manual"}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                            {item.customer_name ?? "—"}
                          </td>
                          <td className="max-w-[160px] truncate px-3 py-3 text-muted-foreground">
                            {item.reason ?? "—"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                            {item.location?.location_name ?? "—"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">
                            {totalQty}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <Badge variant="outline" className={cn("text-[10px] leading-tight", STATUS_STYLE[item.status] ?? "")}>
                              {STATUS_LABEL[item.status] ?? item.status}
                            </Badge>
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
                onPerPageChange={(s) => { setPerPage(s); resetPage() }}
                pageSizeOptions={[15, 30, 50]}
                total={meta.total}
                label="retur"
              />
            </div>
          )}
        </div>
      </LiquidGlass>
    </div>
  )
}
