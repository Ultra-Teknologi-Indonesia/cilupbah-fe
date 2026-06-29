"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import type { PaginationState } from "@tanstack/react-table"
import { AlertTriangleIcon, RefreshCwIcon, SearchXIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { DataTable } from "@/components/ui/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCategoryTree } from "@/hooks/master-produk/use-master-data"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
import { usePantauan, useRefreshChannelData } from "@/hooks/master-produk/use-pantauan"
import type { SelectedCategory } from "@/types/master-produk"
import type {
  PantauanLens,
  ProductTypeFilter,
} from "@/services/master-produk/pantauan.service"
import { FilterToolbar } from "../filter-toolbar"
import { CategoryPicker } from "../buat/category-picker"
import { buildPantauanColumns } from "./pantauan-columns"

const LENSES: { id: PantauanLens; label: string }[] = [
  { id: "belum_upload", label: "Belum Upload" },
  { id: "atribut", label: "Atribut Tidak Seragam" },
  { id: "harga", label: "Harga Tidak Seragam" },
  { id: "sku", label: "SKU Tidak Seragam" },
  { id: "persyaratan", label: "Persyaratan Channel" },
  { id: "direview", label: "Direview" },
  { id: "ditolak", label: "Ditolak" },
]

const TYPES: { value: "all" | ProductTypeFilter; label: string }[] = [
  { value: "all", label: "Semua Tipe" },
  { value: "satuan", label: "Satuan" },
  { value: "bundle", label: "Bundle" },
  { value: "konsinyasi", label: "Konsinyasi" },
]

export function PantauanView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlLens = searchParams.get("lens")
  const lens = (LENSES.some((l) => l.id === urlLens) ? urlLens : "belum_upload") as PantauanLens

  // Filters — applied immediately on change (no "Terapkan" button).
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [category, setCategory] = React.useState<SelectedCategory | null>(null)
  const [channel, setChannel] = React.useState<string | null>(null)
  const [type, setType] = React.useState<"all" | ProductTypeFilter>("all")

  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const resetPage = React.useCallback(() => setPagination((p) => ({ ...p, pageIndex: 0 })), [])

  // Debounce search input.
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      resetPage()
    }, 350)
    return () => clearTimeout(t)
  }, [search, resetPage])

  // Reset halaman saat ganti lensa.
  const [prevLens, setPrevLens] = React.useState(lens)
  if (prevLens !== lens) {
    setPrevLens(lens)
    if (pagination.pageIndex !== 0) setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  const { data: categoryTree = [] } = useCategoryTree()
  const { data: stores = [] } = useConnectedStores()
  const channelOptions = React.useMemo(() => {
    const seen = new Map<string, string>()
    for (const s of stores) {
      if (s.channel?.code) seen.set(s.channel.code, s.channel.name ?? s.channel.code)
    }
    return Array.from(seen, ([value, label]) => ({ value, label }))
  }, [stores])

  const query = usePantauan({
    lens,
    search: debouncedSearch || undefined,
    categoryId: category?.id || undefined,
    channel: channel || undefined,
    type: type === "all" ? undefined : type,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const items = query.data?.items ?? []
  const total = query.data?.meta?.total ?? 0
  const columns = React.useMemo(() => buildPantauanColumns(lens), [lens])

  const refresh = useRefreshChannelData()

  const hasFilter = !!(search || category || channel || type !== "all")

  const reset = () => {
    setSearch("")
    setDebouncedSearch("")
    setCategory(null)
    setChannel(null)
    setType("all")
    resetPage()
  }

  // Non-search filter changes reset pagination immediately.
  const handleCategoryChange = (v: SelectedCategory | null) => {
    setCategory(v)
    resetPage()
  }
  const handleChannelChange = (v: string | null) => {
    setChannel(v)
    resetPage()
  }
  const handleTypeChange = (v: string) => {
    setType(v as "all" | ProductTypeFilter)
    resetPage()
  }

  const setLens = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("lens", next)
    window.history.pushState(null, "", `${pathname}?${params.toString()}`)
  }

  return (
    <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
      {/* Header: lens tabs + refresh + total */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 pt-3 sm:px-5">
        <div className="overflow-x-auto">
          <Tabs value={lens} onValueChange={setLens}>
            <TabsList variant="line">
              {LENSES.map((l) => (
                <TabsTrigger key={l.id} value={l.id}>
                  {l.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-3 pb-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending}
            title="Tarik ulang data dari channel"
          >
            <RefreshCwIcon className={cn("size-4", refresh.isPending && "animate-spin motion-reduce:animate-none")} />
            Refresh
          </Button>
          <span className="text-sm text-muted-foreground">
            Total <span className="font-medium text-foreground tabular-nums">{total}</span>
          </span>
        </div>
      </div>

      {/* Inline filter toolbar */}
      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama & SKU"
        onReset={hasFilter ? reset : undefined}
        hasFilter={hasFilter}
        activeCount={
          (category ? 1 : 0) +
          (channel ? 1 : 0) +
          (type !== "all" ? 1 : 0)
        }
      >
        <CategoryPicker
          value={category}
          onChange={handleCategoryChange}
          tree={categoryTree}
          triggerClassName="h-9 bg-background"
        />
        <Combobox
          options={channelOptions}
          value={channel}
          onChange={handleChannelChange}
          placeholder="Pilih channel"
          searchPlaceholder="Cari channel"
          className="h-9 bg-background"
        />
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="h-9 w-auto min-w-[140px] rounded-full bg-background">
            <SelectValue placeholder="Tipe Produk" />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterToolbar>

      {/* Content */}
      <div className="px-4 py-5 sm:px-5">
        {query.isError ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertTriangleIcon className="size-8 text-destructive" />
            <p className="font-medium">Gagal memuat data</p>
            <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
              Coba lagi
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={items}
            isLoading={query.isLoading}
            getRowId={(p) => p.productId}
            hideToolbar
            manualPagination
            rowCount={total}
            pagination={pagination}
            onPaginationChange={setPagination}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <div className="flex flex-col items-center gap-2 py-6">
                <SearchXIcon className="size-8 text-muted-foreground" />
                <p className="font-medium">Tidak ada produk</p>
                <p className="text-sm text-muted-foreground">Coba ubah filter atau lensa.</p>
              </div>
            }
          />
        )}
      </div>
    </LiquidGlass>
  )
}
