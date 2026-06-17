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
import type { SelectedCategory } from "@/types/master-produk"
import { CategoryPicker } from "../buat/category-picker"
import { ProductCardView } from "../product-card-view"
import { ProductTable } from "../product-table"

type View = "card" | "table"

export function HasilTab() {
  const [view, setView] = React.useState<View>("card")
  const { data: brandOptions = [] } = useBrandOptions()
  const { data: categoryTree = [] } = useCategoryTree()

  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [brandId, setBrandId] = React.useState<string | null>(null)
  const [category, setCategory] = React.useState<SelectedCategory | null>(null)
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
    sort,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const items = query.data?.items ?? []
  const total = query.data?.meta?.total ?? 0
  const isLoading = query.isLoading
  const hasFilter = Boolean(search || brandId || category || sorting.length)

  const reset = () => {
    setSearch("")
    setDebounced("")
    setBrandId(null)
    setCategory(null)
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
          options={brandOptions}
          value={brandId}
          onChange={setBrandId}
          placeholder="Semua merek"
          searchPlaceholder="Cari merek"
          className="h-9 w-44 rounded-full"
        />
        <div className="w-full sm:w-56">
          <CategoryPicker value={category} onChange={setCategory} tree={categoryTree} triggerClassName="h-9 rounded-full" />
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
