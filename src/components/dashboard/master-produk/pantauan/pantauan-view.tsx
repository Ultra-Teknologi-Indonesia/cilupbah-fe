"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import type { PaginationState } from "@tanstack/react-table"
import { AlertTriangleIcon, RefreshCwIcon, SearchIcon, SearchXIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { DataTable } from "@/components/ui/data-table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCategoryTree } from "@/hooks/master-produk/use-master-data"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
import { usePantauan, useRefreshChannelData } from "@/hooks/master-produk/use-pantauan"
import type { SelectedCategory } from "@/types/master-produk"
import type {
  PantauanLens,
  ProductTypeFilter,
} from "@/services/master-produk/pantauan.service"
import { CategoryPicker } from "../buat/category-picker"
import { buildPantauanColumns } from "./pantauan-columns"

const LENSES: { id: PantauanLens; label: string }[] = [
  { id: "belum_upload", label: "Belum Upload" },
  { id: "atribut", label: "Atribut Tidak Seragam" },
  { id: "harga", label: "Harga Tidak Seragam" },
  { id: "sku", label: "SKU Tidak Seragam" },
]

const TYPES: { value: "" | ProductTypeFilter; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "satuan", label: "Satuan" },
  { value: "bundle", label: "Bundle" },
  { value: "konsinyasi", label: "Konsinyasi" },
]

export function PantauanView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlLens = searchParams.get("lens")
  const lens = (LENSES.some((l) => l.id === urlLens) ? urlLens : "belum_upload") as PantauanLens

  // Filter draft (panel) → applied (Terapkan).
  const [dSearch, setDSearch] = React.useState("")
  const [dCategory, setDCategory] = React.useState<SelectedCategory | null>(null)
  const [dChannel, setDChannel] = React.useState<string | null>(null)
  const [dType, setDType] = React.useState<"" | ProductTypeFilter>("")
  const [applied, setApplied] = React.useState<{
    search: string
    category: SelectedCategory | null
    channel: string | null
    type: "" | ProductTypeFilter
  }>({ search: "", category: null, channel: null, type: "" })

  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 25 })
  const resetPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }))

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
    search: applied.search || undefined,
    categoryId: applied.category?.id || undefined,
    channel: applied.channel || undefined,
    type: applied.type || undefined,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const items = query.data?.items ?? []
  const total = query.data?.meta?.total ?? 0
  const columns = React.useMemo(() => buildPantauanColumns(lens), [lens])

  const refresh = useRefreshChannelData()

  const setLens = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("lens", next)
    // Update URL secara client-side (tetap deep-linkable & sinkron dengan
    // useSearchParams) TANPA navigasi server. router.replace memicu RSC fetch
    // tiap klik tab → tab terasa macet & berat. pushState instan + menambah
    // entri history, jadi tombol Back browser kembali ke tab sebelumnya.
    window.history.pushState(null, "", `${pathname}?${params.toString()}`)
  }

  const apply = () => {
    setApplied({ search: dSearch, category: dCategory, channel: dChannel, type: dType })
    resetPage()
  }
  const reset = () => {
    setDSearch("")
    setDCategory(null)
    setDChannel(null)
    setDType("")
    setApplied({ search: "", category: null, channel: null, type: "" })
    resetPage()
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      {/* Panel filter */}
      <aside className="lg:w-64 lg:shrink-0">
        <LiquidGlass radius={20} intensity="subtle" className="bg-white/40 p-4 dark:bg-white/[0.06]">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium">Filter</span>
            <button type="button" onClick={reset} className="text-sm font-medium text-destructive hover:underline">
              Reset
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={dSearch}
                onChange={(e) => setDSearch(e.target.value)}
                placeholder="Cari nama & SKU"
                className="h-9 rounded-lg border-border bg-background pl-9"
              />
            </div>

            <CategoryPicker value={dCategory} onChange={setDCategory} tree={categoryTree} triggerClassName="h-9 rounded-lg" />

            <Combobox
              options={channelOptions}
              value={dChannel}
              onChange={setDChannel}
              placeholder="Pilih channel"
              searchPlaceholder="Cari channel"
              className="h-9 rounded-lg"
            />

            <div>
              <div className="mb-1.5 text-sm font-medium">Tipe Produk</div>
              <div className="flex flex-col gap-1">
                {TYPES.map((t) => (
                  <button
                    key={t.value || "all"}
                    type="button"
                    onClick={() => setDType(t.value)}
                    className="flex items-center gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        "grid size-4 place-items-center rounded-full border",
                        dType === t.value ? "border-primary" : "border-border"
                      )}
                    >
                      {dType === t.value && <span className="size-2 rounded-full bg-primary" />}
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="primary" className="mt-1 w-full" onClick={apply}>
              Terapkan
            </Button>
          </div>
        </LiquidGlass>
      </aside>

      {/* Konten */}
      <div className="min-w-0 flex-1">
        <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
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
      </div>
    </div>
  )
}
