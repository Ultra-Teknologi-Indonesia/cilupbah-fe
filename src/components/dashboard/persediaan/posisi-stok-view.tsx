"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  PackageIcon,
  ArrowUpDown,
  ChevronUpIcon,
  ChevronDownIcon,
  BoxesIcon,
  BoxIcon,
} from "lucide-react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { useStockPosition, inventoryKeys } from "@/hooks/persediaan/use-stock-position"
import { InventoryStockService } from "@/services/persediaan/inventory.service"
import type { StockItem, StockListParams } from "@/types/persediaan/stock"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

type SortField = "item_code" | "average_cost" | "on_hand" | "available"
type SortDir = "asc" | "desc"
type StockFilter = "all" | "single" | "bundle"

const STOCK_FILTER_TABS: { key: StockFilter; label: string; icon: typeof PackageIcon }[] = [
  { key: "all", label: "Semua", icon: PackageIcon },
  { key: "single", label: "Satuan", icon: BoxIcon },
  { key: "bundle", label: "Bundle", icon: BoxesIcon },
]

interface FilterState {
  location_id: string
  channel: string
}

const EMPTY_FILTERS: FilterState = { location_id: "", channel: "" }

function SortHeader({
  label,
  field,
  activeField,
  dir,
  onSort,
  align = "left",
}: {
  label: string
  field: SortField
  activeField: SortField | null
  dir: SortDir
  onSort: (f: SortField) => void
  align?: "left" | "right"
}) {
  const isActive = activeField === field
  return (
    <th
      className={cn(
        "whitespace-nowrap px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
        "cursor-pointer select-none transition-colors hover:text-foreground",
        align === "right" && "text-right",
      )}
      onClick={() => onSort(field)}
    >
      <span className={cn("inline-flex items-center gap-1", align === "right" && "justify-end")}>
        {label}
        {isActive ? (
          dir === "asc" ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </span>
    </th>
  )
}

function StockSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border/40 px-3 py-3">
        <div className="flex gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="border-b border-border/20 px-3 py-3.5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="flex flex-1 gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function StockQtyBadge({ value, variant }: { value: number; variant: "default" | "warning" | "success" }) {
  const colors = {
    default: "",
    warning: value > 0 ? "text-orange-600 dark:text-orange-400" : "",
    success: value > 0 ? "text-emerald-600 dark:text-emerald-400" : "",
  }
  return (
    <span className={cn("font-mono text-sm font-semibold tabular-nums", colors[variant])}>
      {value}
    </span>
  )
}

export function PosisiStokView() {
  const router = useRouter()
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  const resetPage = useCallback(() => setPage(1), [])

  // Prefetch saat hover: hangatkan route (JS/RSC shell) + data entitas utama
  // detail, jadi klik ke halaman detail terasa instan tanpa flash skeleton.
  const prefetchDetail = useCallback(
    (itemId: string) => {
      router.prefetch(`/dashboard/posisi-stok/${itemId}`)
      qc.prefetchQuery({
        queryKey: inventoryKeys.item(itemId),
        queryFn: () => InventoryStockService.getItem(itemId),
        staleTime: 30_000,
      })
      qc.prefetchQuery({
        queryKey: inventoryKeys.itemStock(itemId),
        queryFn: () => InventoryStockService.getItemStock(itemId),
        staleTime: 30_000,
      })
    },
    [router, qc]
  )

  // Input responsif seketika; commit ke params (pemicu fetch) di-debounce 350ms
  // agar tidak ada request per karakter.
  const handleSearch = useCallback((v: string) => {
    setSearch(v)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      resetPage()
    }, 350)
    return () => clearTimeout(t)
  }, [search, resetPage])

  const handleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
        return field
      }
      setSortDir("asc")
      return field
    })
    resetPage()
  }, [resetPage])

  const handleStockFilter = useCallback((f: StockFilter) => {
    setStockFilter(f)
    resetPage()
  }, [resetPage])

  const handleFilterChange = useCallback((f: FilterState) => {
    setFilters(f)
    resetPage()
  }, [resetPage])

  const SERVER_SORT_MAP: Partial<Record<SortField, string>> = {
    item_code: "product_variants.sku",
  }

  const sortParam = useMemo(() => {
    if (!sortField) return undefined
    const mapped = SERVER_SORT_MAP[sortField]
    if (!mapped) return undefined
    return sortDir === "desc" ? `-${mapped}` : mapped
  }, [sortField, sortDir])

  const bundleFilter = useMemo(() => {
    if (stockFilter === "bundle") return "1"
    if (stockFilter === "single") return "0"
    return undefined
  }, [stockFilter])

  const params = useMemo<StockListParams>(() => ({
    search: debouncedSearch || undefined,
    page,
    per_page: perPage,
    sort: sortParam,
    "filter[is_bundle]": bundleFilter,
    "filter[location_id]": filters.location_id || undefined,
    "filter[channel]": filters.channel || undefined,
  }), [debouncedSearch, page, perPage, sortParam, bundleFilter, filters.location_id, filters.channel])

  const { data, isLoading, isFetching } = useStockPosition(params)

  const items = useMemo(() => {
    const raw = data?.data ?? []
    if (!sortField || SERVER_SORT_MAP[sortField]) return raw
    return [...raw].sort((a, b) => {
      let av: number, bv: number
      switch (sortField) {
        case "average_cost": av = Number(a.average_cost); bv = Number(b.average_cost); break
        case "on_hand": av = a.total_stocks.on_hand; bv = b.total_stocks.on_hand; break
        case "available": av = a.total_stocks.available; bv = b.total_stocks.available; break
        default: return 0
      }
      return sortDir === "asc" ? av - bv : bv - av
    })
  }, [data?.data, sortField, sortDir])

  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0, channels: [], locations: [] }

  const locationOptions = useMemo(() => [
    { value: "", label: "Semua Lokasi" },
    ...meta.locations.map((l) => ({ value: l.location_id, label: l.location_name })),
  ], [meta.locations])

  const channelOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const c of meta.channels) {
      if (c.channel_code && !seen.has(c.channel_code)) {
        seen.set(c.channel_code, c.channel_name)
      }
    }
    return [
      { value: "", label: "Semua Channel" },
      ...Array.from(seen, ([value, label]) => ({ value, label })),
    ]
  }, [meta.channels])

  const hasActiveFilter = Object.values(filters).some(Boolean)
  const activeCount = [filters.location_id, filters.channel].filter(Boolean).length

  const filterTabs = (
    <div className="flex items-center gap-1">
      {STOCK_FILTER_TABS.map(({ key, label, icon: Icon }) => {
        const isActive = stockFilter === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleStockFilter(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-foreground text-background shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <FilterToolbar
          search={search}
          onSearchChange={handleSearch}
          searchPlaceholder="Cari produk atau SKU..."
          align="end"
          leading={filterTabs}
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

          <Combobox
            options={channelOptions}
            value={filters.channel}
            onChange={(v) => handleFilterChange({ ...filters, channel: v ?? "" })}
            placeholder="Channel"
            searchPlaceholder="Cari channel"
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
            <StockSkeleton />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
              <PackageIcon className="h-10 w-10" />
              <div className="text-center">
                <p className="text-sm font-medium">Belum ada data stok</p>
                <p className="mt-1 text-xs">Produk yang memiliki stok akan muncul di sini.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      <SortHeader label="Produk" field="item_code" activeField={sortField} dir={sortDir} onSort={handleSort} />
                      <th
                        className={cn(
                          "whitespace-nowrap px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground",
                          "cursor-pointer select-none transition-colors hover:text-foreground",
                        )}
                        onClick={() => handleSort("average_cost")}
                      >
                        <span className="inline-flex items-center justify-end gap-1">
                          Harga Pokok
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoIcon
                                className="h-3 w-3 opacity-60"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Metode valuasi: Moving Average (rata-rata
                              tertimbang).
                            </TooltipContent>
                          </Tooltip>
                          {sortField === "average_cost" ? (
                            sortDir === "asc" ? (
                              <ChevronUpIcon className="h-3 w-3" />
                            ) : (
                              <ChevronDownIcon className="h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </span>
                      </th>
                      <SortHeader label="On Hand" field="on_hand" activeField={sortField} dir={sortDir} onSort={handleSort} align="right" />
                      <th className="whitespace-nowrap px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        On Order
                      </th>
                      <th className="whitespace-nowrap px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Reserved
                      </th>
                      <SortHeader label="Available" field="available" activeField={sortField} dir={sortDir} onSort={handleSort} align="right" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: StockItem) => (
                      <tr
                        key={item.item_id}
                        onClick={() => router.push(`/dashboard/posisi-stok/${item.item_id}`)}
                        onMouseEnter={() => prefetchDetail(item.item_id)}
                        onFocus={() => prefetchDetail(item.item_id)}
                        className="cursor-pointer border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            {item.thumbnail ? (
                              <Image
                                src={item.thumbnail}
                                alt={item.item_name ?? item.item_code}
                                width={40}
                                height={40}
                                className="h-10 w-10 shrink-0 rounded-lg border border-border/40 object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                                <PackageIcon className="h-5 w-5 text-muted-foreground/60" />
                              </div>
                            )}
                            <div className="flex min-w-0 flex-col gap-0.5" style={{ maxWidth: 320 }}>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="whitespace-normal break-words text-sm font-medium text-foreground">
                                  {item.item_name || item.item_code}
                                </span>
                                {item.is_bundle && (
                                  <Badge variant="outline" className="shrink-0 text-[10px] leading-tight border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400">
                                    Bundle
                                  </Badge>
                                )}
                              </div>
                              {item.variation_values.length > 0 && (
                                <span className="whitespace-normal break-words text-xs text-foreground">
                                  {item.variation_values.map((v) => v.value).join(", ")}
                                </span>
                              )}
                              <span className="font-mono text-[11px] text-foreground/80">
                                {item.item_code}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right text-sm text-foreground">
                          {formatCurrency(Number(item.average_cost))}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <StockQtyBadge value={item.total_stocks.on_hand} variant="default" />
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <StockQtyBadge value={item.total_stocks.on_order} variant="default" />
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <StockQtyBadge value={item.total_stocks.reserved} variant="warning" />
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <StockQtyBadge value={item.total_stocks.available} variant="success" />
                        </td>
                      </tr>
                    ))}
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
                label="produk"
              />
            </div>
          )}
        </div>
      </LiquidGlass>
    </div>
  )
}
