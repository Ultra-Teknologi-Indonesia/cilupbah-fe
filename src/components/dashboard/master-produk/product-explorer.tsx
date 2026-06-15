"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  LayoutGridIcon,
  TableIcon,
  PlusIcon,
  UploadIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { PRODUCT_STATUS_OPTIONS } from "@/lib/master-produk/constants"
import {
  useBrandOptions,
  useCategoryTree,
} from "@/hooks/master-produk/use-master-data"
import type { useProductListQuery } from "@/hooks/master-produk/use-product-list-query"
import { CategoryPicker } from "./buat/category-picker"
import { ProductTable } from "./product-table"
import { ProductCardView } from "./product-card-view"

type View = "card" | "table"
type Query = ReturnType<typeof useProductListQuery>

export function ProductExplorer({ query }: { query: Query }) {
  const router = useRouter()
  const [view, setView] = React.useState<View>("card")
  const { data: brandOptions = [] } = useBrandOptions()
  const { data: categoryTree = [] } = useCategoryTree()

  const items = query.result.data?.items ?? []
  const total = query.result.data?.meta?.total ?? 0
  const isLoading = query.result.isLoading

  const viewProps = {
    items,
    total,
    isLoading,
    sorting: query.sorting,
    onSortingChange: query.setSorting,
    pagination: query.pagination,
    onPaginationChange: query.setPagination,
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
    <LiquidGlass
      radius={24}
      intensity="default"
      className="bg-white/40 dark:bg-white/[0.06]"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 className="text-base font-medium">Daftar Produk</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Memuat…" : `${total} produk`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-full bg-black/[0.06] p-1 ring-1 ring-border/60 dark:bg-white/10">
            {toggleBtn("card", "Tampilan kartu", LayoutGridIcon)}
            {toggleBtn("table", "Tampilan tabel", TableIcon)}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={() => toast("Impor produk", { description: "Segera hadir" })}
          >
            <UploadIcon className="size-4" />
            <span className="hidden sm:inline">Impor</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="h-9 gap-2"
            onClick={() => router.push("/dashboard/master-produk/buat")}
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">Tambah Produk</span>
          </Button>
        </div>
      </div>

      {/* Toolbar server-driven (search + status + merek) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-5 py-3 sm:px-6">
        <div className="relative w-full max-w-xs sm:w-64">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query.search}
            onChange={(e) => query.setSearch(e.target.value)}
            placeholder="Cari nama / SKU…"
            className="h-9 rounded-full border-border bg-background pl-9 pr-8"
          />
          {query.search.length > 0 && (
            <button
              type="button"
              onClick={() => query.setSearch("")}
              aria-label="Bersihkan pencarian"
              className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
        <Combobox
          options={PRODUCT_STATUS_OPTIONS}
          value={query.status}
          onChange={query.setStatus}
          placeholder="Semua status"
          searchPlaceholder="Cari status"
          className="h-9 w-40 rounded-full"
        />
        <Combobox
          options={brandOptions}
          value={query.brandId}
          onChange={query.setBrandId}
          placeholder="Semua merek"
          searchPlaceholder="Cari merek"
          className="h-9 w-44 rounded-full"
        />
        <div className="w-full sm:w-56">
          <CategoryPicker
            value={query.category}
            onChange={query.setCategory}
            tree={categoryTree}
            triggerClassName="h-9 rounded-full"
          />
        </div>
        {query.hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 rounded-full px-3"
            onClick={query.reset}
          >
            Reset
            <XIcon className="size-4" />
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-5 sm:px-6">
        {view === "card" ? (
          <ProductCardView {...viewProps} />
        ) : (
          <ProductTable {...viewProps} />
        )}
      </div>
    </LiquidGlass>
  )
}
