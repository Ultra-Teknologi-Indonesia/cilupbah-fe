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
  ChevronDownIcon,
  PackageIcon,
  LayersIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PRODUCT_STATUS_OPTIONS } from "@/lib/master-produk/constants"
import {
  useBrandOptions,
  useCategoryTree,
} from "@/hooks/master-produk/use-master-data"
import type { useProductListQuery } from "@/hooks/master-produk/use-product-list-query"
import type { ImportBatchType } from "@/services/master-produk/import.service"
import { CategoryPicker } from "./buat/category-picker"
import { FilterShell } from "./filter-shell"
import { ImportDialog } from "./import/import-dialog"
import { ProductTable } from "./product-table"
import { ProductCardView } from "./product-card-view"

type View = "card" | "table"
type Query = ReturnType<typeof useProductListQuery>

export function ProductExplorer({ query }: { query: Query }) {
  const router = useRouter()
  const [view, setView] = React.useState<View>("card")
  const [importType, setImportType] = React.useState<ImportBatchType | null>(null)
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

  const filters = (
    <>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query.search}
          onChange={(e) => query.setSearch(e.target.value)}
          placeholder="Cari nama / SKU…"
          className="h-9 border-border bg-background pl-9 pr-8"
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
        className="h-9 w-full"
      />
      <Combobox
        options={brandOptions}
        value={query.brandId}
        onChange={query.setBrandId}
        placeholder="Semua merek"
        searchPlaceholder="Cari merek"
        className="h-9 w-full"
      />
      <CategoryPicker
        value={query.category}
        onChange={query.setCategory}
        tree={categoryTree}
        triggerClassName="h-9 w-full"
      />
    </>
  )

  return (
    <FilterShell filters={filters} onReset={query.hasFilter ? query.reset : undefined}>
      <LiquidGlass
        radius={24}
        intensity="default"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <UploadIcon className="size-4" />
                  <span className="hidden sm:inline">Impor</span>
                  <ChevronDownIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem
                  onSelect={() => setImportType("single")}
                  className="flex-col items-start gap-0.5"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <PackageIcon className="size-4" />
                    Import Produk Satuan
                  </span>
                  <span className="pl-6 text-xs text-muted-foreground">
                    Buat/update produk dari file Excel.
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setImportType("bundle")}
                  className="flex-col items-start gap-0.5"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <LayersIcon className="size-4" />
                    Import Produk Bundle
                  </span>
                  <span className="pl-6 text-xs text-muted-foreground">
                    Atur komposisi bundle dari file Excel.
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="primary" size="sm" className="h-9 gap-2">
                  <PlusIcon className="size-4" />
                  <span className="hidden sm:inline">Tambah Produk</span>
                  <ChevronDownIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem
                  onSelect={() => router.push("/dashboard/master-produk/buat")}
                  className="flex-col items-start gap-0.5"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <PackageIcon className="size-4" />
                    Buat Produk Satuan
                  </span>
                  <span className="pl-6 text-xs text-muted-foreground">
                    Produk dengan varian, harga, dan media.
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => router.push("/dashboard/master-produk/buat-bundle")}
                  className="flex-col items-start gap-0.5"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <LayersIcon className="size-4" />
                    Buat Produk Bundle
                  </span>
                  <span className="pl-6 text-xs text-muted-foreground">
                    Gabungkan beberapa produk jadi satu SKU.
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {view === "card" ? (
            <ProductCardView {...viewProps} />
          ) : (
            <ProductTable {...viewProps} />
          )}
        </div>
      </LiquidGlass>

      {importType && (
        <ImportDialog
          type={importType}
          open={!!importType}
          onOpenChange={(o) => !o && setImportType(null)}
        />
      )}
    </FilterShell>
  )
}
