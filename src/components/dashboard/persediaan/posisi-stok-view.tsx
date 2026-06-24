"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  SearchIcon,
  PackageIcon,
  ArrowUpDown,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { useStockPosition } from "@/hooks/persediaan/use-stock-position"
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
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const resetPage = useCallback(() => setPage(1), [])

  const handleSearch = useCallback((v: string) => {
    setSearch(v)
    resetPage()
  }, [resetPage])

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

  const SERVER_SORT_MAP: Partial<Record<SortField, string>> = {
    item_code: "product_variants.sku",
  }

  const sortParam = useMemo(() => {
    if (!sortField) return undefined
    const mapped = SERVER_SORT_MAP[sortField]
    if (!mapped) return undefined
    return sortDir === "desc" ? `-${mapped}` : mapped
  }, [sortField, sortDir])

  const params = useMemo<StockListParams>(() => ({
    search: search || undefined,
    page,
    per_page: perPage,
    sort: sortParam,
  }), [search, page, perPage, sortParam])

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

  return (
    <div className="flex flex-col gap-4">
      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        {/* Search Bar */}
        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3 sm:px-5">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari produk, SKU, atau merek..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>
          {isFetching && !isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
        </div>

        {/* Table */}
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
                      <SortHeader label="Harga Pokok" field="average_cost" activeField={sortField} dir={sortDir} onSort={handleSort} align="right" />
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
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium leading-tight">
                                {item.item_name || item.item_code}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {item.item_code}
                                {item.brand_name && ` · ${item.brand_name}`}
                              </p>
                              {item.variation_values.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {item.variation_values.map((v) => (
                                    <Badge key={`${v.label}-${v.value}`} variant="secondary" className="text-[10px] leading-tight">
                                      {v.value}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right text-sm text-muted-foreground">
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
