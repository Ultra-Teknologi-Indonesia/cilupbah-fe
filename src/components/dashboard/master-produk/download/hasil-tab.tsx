"use client"

import * as React from "react"
import type { PaginationState, SortingState } from "@tanstack/react-table"
import { LayoutGridIcon, SearchIcon, TableIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  useBrandOptions,
  useCategoryTree,
} from "@/hooks/master-produk/use-master-data"
import { useMasterProducts } from "@/hooks/master-produk/use-master-products"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
import type { SelectedCategory } from "@/types/master-produk"
import { CategoryPicker } from "../buat/category-picker"
import { ProductCardView } from "../product-card-view"
import { ProductTable } from "../product-table"

type View = "card" | "table"

const TYPE_OPTIONS = [
  { value: "satuan", label: "Satuan" },
  { value: "bundle", label: "Bundle" },
  { value: "konsinyasi", label: "Konsinyasi" },
  { value: "pre_order", label: "Pre-Order" },
]

export function HasilTab() {
  const [view, setView] = React.useState<View>("card")
  const { data: brandOptions = [] } = useBrandOptions()
  const { data: categoryTree = [] } = useCategoryTree()
  const { data: stores = [] } = useConnectedStores()
  const channelOptions = React.useMemo(() => {
    const seen = new Map<string, string>()
    for (const s of stores) {
      if (s.channel?.code) seen.set(s.channel.code, s.channel.name ?? s.channel.code)
    }
    return Array.from(seen, ([value, label]) => ({ value, label }))
  }, [stores])

  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [brandId, setBrandId] = React.useState<string | null>(null)
  const [category, setCategory] = React.useState<SelectedCategory | null>(null)
  const [type, setType] = React.useState<string | null>(null)
  const [channel, setChannel] = React.useState<string | null>(null)
  const [dMin, setDMin] = React.useState("")
  const [dMax, setDMax] = React.useState("")
  const [price, setPrice] = React.useState<{ min?: number; max?: number }>({})
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 24 })

  const resetPage = React.useCallback(() => setPagination((p) => ({ ...p, pageIndex: 0 })), [])

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search)
      resetPage()
    }, 350)
    return () => clearTimeout(t)
  }, [search, resetPage])

  const sort = sorting[0]
    ? `${sorting[0].desc ? "-" : ""}${sorting[0].id === "itemName" ? "name" : sorting[0].id === "lastModified" ? "updated_at" : sorting[0].id}`
    : undefined

  const query = useMasterProducts({
    status: "download",
    search: debounced || undefined,
    brandId: brandId || undefined,
    categoryId: category?.id || undefined,
    type: type || undefined,
    channel: channel || undefined,
    minPrice: price.min,
    maxPrice: price.max,
    sort,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const items = query.data?.items ?? []
  const total = query.data?.meta?.total ?? 0
  const isLoading = query.isLoading
  const hasFilter = Boolean(
    search || brandId || category || type || channel || price.min != null || price.max != null || sorting.length
  )

  const applyPrice = () => {
    const min = dMin.trim() ? Number(dMin) : undefined
    const max = dMax.trim() ? Number(dMax) : undefined
    setPrice({
      min: Number.isFinite(min) ? min : undefined,
      max: Number.isFinite(max) ? max : undefined,
    })
    resetPage()
  }

  const reset = () => {
    setSearch("")
    setDebounced("")
    setBrandId(null)
    setCategory(null)
    setType(null)
    setChannel(null)
    setDMin("")
    setDMax("")
    setPrice({})
    setSorting([])
    resetPage()
  }

  const viewProps = {
    items,
    total,
    isLoading,
    sorting,
    onSortingChange: setSorting,
    pagination,
    onPaginationChange: setPagination,
  }

  const toggleBtn = (target: View, label: string, Icon: typeof LayoutGridIcon) => (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn(
        "size-7 rounded-full",
        view === target
          ? "bg-background text-foreground shadow-sm hover:bg-background"
          : "text-muted-foreground hover:bg-transparent hover:text-foreground"
      )}
      onClick={() => setView(target)}
      aria-label={label}
      aria-pressed={view === target}
    >
      <Icon className="size-4" />
    </Button>
  )

  return (
    <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-medium">Produk Hasil Download</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Memuat…" : `${total} produk`}
          </p>
        </div>
        <div className="flex items-center gap-0.5 rounded-full bg-black/[0.06] p-1 ring-1 ring-border/60 dark:bg-white/10">
          {toggleBtn("card", "Tampilan kartu", LayoutGridIcon)}
          {toggleBtn("table", "Tampilan tabel", TableIcon)}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-5 py-3 sm:px-6">
        <div className="relative w-full max-w-xs sm:w-64">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / SKU…"
            className="h-9 rounded-full border-border bg-background pl-9 pr-8"
          />
          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Bersihkan pencarian"
              className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
        <Combobox
          options={TYPE_OPTIONS}
          value={type}
          onChange={(v) => {
            setType(v)
            resetPage()
          }}
          placeholder="Semua tipe"
          searchPlaceholder="Cari tipe"
          className="h-9 w-40 rounded-full"
        />
        <Combobox
          options={brandOptions}
          value={brandId}
          onChange={(v) => {
            setBrandId(v)
            resetPage()
          }}
          placeholder="Semua merek"
          searchPlaceholder="Cari merek"
          className="h-9 w-44 rounded-full"
        />
        <Combobox
          options={channelOptions}
          value={channel}
          onChange={(v) => {
            setChannel(v)
            resetPage()
          }}
          placeholder="Semua channel"
          searchPlaceholder="Cari channel"
          className="h-9 w-44 rounded-full"
        />
        <div className="w-full sm:w-56">
          <CategoryPicker
            value={category}
            onChange={(v) => {
              setCategory(v)
              resetPage()
            }}
            tree={categoryTree}
            triggerClassName="h-9 rounded-full"
          />
        </div>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            inputMode="numeric"
            value={dMin}
            onChange={(e) => setDMin(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            placeholder="Harga min"
            className="h-9 w-28 rounded-full"
            aria-label="Harga minimal"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="numeric"
            value={dMax}
            onChange={(e) => setDMax(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            placeholder="Harga max"
            className="h-9 w-28 rounded-full"
            aria-label="Harga maksimal"
          />
        </div>
        {hasFilter && (
          <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-full px-3" onClick={reset}>
            Reset
            <XIcon className="size-4" />
          </Button>
        )}
      </div>

      <div className="px-5 py-5 sm:px-6">
        {view === "card" ? <ProductCardView {...viewProps} /> : <ProductTable {...viewProps} />}
      </div>
    </LiquidGlass>
  )
}
