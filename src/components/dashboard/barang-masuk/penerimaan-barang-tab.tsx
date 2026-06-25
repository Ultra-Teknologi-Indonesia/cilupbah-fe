"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { PackageCheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { useInbounds } from "@/hooks/barang-masuk/use-inbound"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import type { Inbound, InboundStatus, InboundType } from "@/types/barang-masuk/inbound"

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "DRAFT", label: "Belum Mulai" },
  { value: "PARTIAL", label: "Sedang Diproses" },
  { value: "RECEIVED", label: "Selesai Diterima" },
  { value: "COMPLETED", label: "Selesai" },
]

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  PARTIAL: "border-amber-300 text-amber-600 dark:border-amber-500/30 dark:text-amber-400",
  RECEIVED: "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  PUTAWAY_IN_PROGRESS: "border-indigo-300 text-indigo-600 dark:border-indigo-500/30 dark:text-indigo-400",
  COMPLETED: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Belum Mulai",
  PARTIAL: "Sebagian",
  RECEIVED: "Selesai Diterima",
  PUTAWAY_IN_PROGRESS: "Sedang Putaway",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
}

const TYPE_LABEL: Record<string, string> = {
  PURCHASE_ORDER: "PO",
  TRANSIT_IN: "Transfer",
  SALES_RETURN: "Retur",
  CONSIGNMENT: "Konsinyasi",
}

const TYPE_STYLE: Record<string, string> = {
  PURCHASE_ORDER: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
  TRANSIT_IN: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400",
  SALES_RETURN: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400",
  CONSIGNMENT: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
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
      {Array.from({ length: 6 }).map((_, i) => (
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

interface FilterState {
  status: string
  location_id: string
}

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" }

export function PenerimaanBarangTab() {
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

  const params = useMemo(() => ({
    search: debouncedSearch || undefined,
    page,
    per_page: perPage,
    "filter[status]": filters.status || undefined,
    "filter[location_id]": filters.location_id || undefined,
  }), [debouncedSearch, page, perPage, filters])

  const { data, isLoading, isFetching } = useInbounds(params)
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
    <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari no. penerimaan..."
        align="end"
        onReset={hasActiveFilter ? () => handleFilterChange(EMPTY_FILTERS) : undefined}
        hasFilter={hasActiveFilter}
        activeCount={activeCount}
        gridCols={2}
      >
        <Combobox
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(v) => handleFilterChange({ ...filters, status: v ?? "" })}
          placeholder="Status"
          searchPlaceholder="Cari status"
          className="h-9 bg-background"
        />
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
            <PackageCheckIcon className="h-10 w-10" />
            <div className="text-center">
              <p className="text-sm font-medium">Belum ada penerimaan barang</p>
              <p className="mt-1 text-xs">Dokumen penerimaan dari PO, Transfer, atau Retur akan tampil di sini.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    {["No. Penerimaan", "Sumber", "No. Referensi", "Tanggal", "Lokasi", "Dibuat Oleh", "Qty Diterima", "Status"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: Inbound) => {
                    const totalRecv = item.items?.reduce((s, i) => s + i.received_qty, 0) ?? 0
                    return (
                      <tr key={item.id} className="border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40">
                        <td className="whitespace-nowrap px-3 py-3 font-medium">
                          {item.transaction_number}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <Badge variant="outline" className={cn("text-[10px] leading-tight", TYPE_STYLE[item.type] ?? "")}>
                            {TYPE_LABEL[item.type] ?? item.type}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.reference_number ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.expected_date ? formatDate(item.expected_date) : formatDate(item.created_at)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.location?.location_name ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.created_by}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">
                          {totalRecv}
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
              label="penerimaan"
            />
          </div>
        )}
      </div>
    </LiquidGlass>
  )
}
