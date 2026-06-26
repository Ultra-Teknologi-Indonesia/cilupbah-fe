"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { DownloadIcon, RefreshCwIcon, TimerIcon, TimerOffIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { MonitorStockTable } from "@/components/dashboard/monitor-stok/monitor-stock-table"
import { MonitorAnalyticsTable, type AnalyticsKind } from "@/components/dashboard/monitor-stok/monitor-analytics-table"
import { MonitorSyncFailedTable } from "@/components/dashboard/monitor-stok/monitor-sync-failed-table"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { useEnabledCategories } from "@/hooks/kategori-merek/use-kategori"
import {
  useMonitorList,
  useMonitorAnalytics,
  useMonitorSummary,
  useFailedSync,
  isLiveTab,
  isStockTab,
  isAnalyticsTab,
  isSyncTab,
} from "@/hooks/monitor-stok/use-monitor-stok"
import type { MonitorTab, MonitorStockRow, MonitorAnalyticsRow, MonitorSyncFailedRow, OutOfStockMode } from "@/types/monitor-stok/monitor"
import type { KategoriItem } from "@/types/kategori-merek/kategori"

const TABS: { key: MonitorTab; label: string }[] = [
  { key: "stok-kosong", label: "Stok Kosong" },
  { key: "menipis", label: "Menipis" },
  { key: "tidak-laku", label: "Tidak Laku" },
  { key: "paling-laku", label: "Paling Laku" },
  { key: "perkiraan-habis", label: "Perkiraan Habis" },
  { key: "sedang-dibeli", label: "Sedang Dibeli" },
  { key: "gagal-sync", label: "Gagal Sync" },
]

const SUB_TABS: { key: OutOfStockMode; label: string }[] = [
  { key: "habis", label: "Habis" },
  { key: "minus", label: "Minus" },
  { key: "dipesan", label: "Dipesan namun habis" },
]

const EMPTY_META = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

const PERIOD_DEFAULT: Record<string, number> = {
  "tidak-laku": 90,
  "paling-laku": 30,
  "perkiraan-habis": 30,
}

const PERIOD_OPTIONS: Record<string, { value: string; label: string }[]> = {
  "tidak-laku": [
    { value: "30", label: "Idle > 30 hari" },
    { value: "60", label: "Idle > 60 hari" },
    { value: "90", label: "Idle > 90 hari" },
    { value: "180", label: "Idle > 180 hari" },
  ],
  "paling-laku": [
    { value: "7", label: "7 hari terakhir" },
    { value: "30", label: "30 hari terakhir" },
    { value: "90", label: "90 hari terakhir" },
  ],
  "perkiraan-habis": [
    { value: "7", label: "Habis ≤ 7 hari" },
    { value: "14", label: "Habis ≤ 14 hari" },
    { value: "30", label: "Habis ≤ 30 hari" },
  ],
}

function flattenCategories(items: KategoriItem[], prefix = ""): { value: string; label: string }[] {
  const result: { value: string; label: string }[] = []
  for (const item of items) {
    const label = prefix ? `${prefix} / ${item.name}` : item.name
    result.push({ value: String(item.id), label })
    if (item.children?.length) result.push(...flattenCategories(item.children, label))
  }
  return result
}

function csvEncode(cells: (string | number | null | undefined)[]): string {
  return cells.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")
}

function exportTabCsv(tab: MonitorTab, rows: MonitorStockRow[] | MonitorAnalyticsRow[] | MonitorSyncFailedRow[], subMode?: string) {
  let header: string[]
  let lines: string[]
  const filename = `monitor-${tab}${tab === "stok-kosong" && subMode ? `-${subMode}` : ""}.csv`

  if (isSyncTab(tab)) {
    const data = rows as MonitorSyncFailedRow[]
    header = ["SKU", "Produk", "Channel", "Toko", "Status", "Error", "Terakhir Sync"]
    lines = data.map((r) => csvEncode([r.sku, r.product_name, r.channel_name, r.shop_name, r.sync_status, r.error_message, r.last_synced_at]))
  } else if (isAnalyticsTab(tab)) {
    const data = rows as MonitorAnalyticsRow[]
    header = ["SKU", "Produk", "On Hand", "Tersedia", "Qty Terjual", "Avg/Hari", "Last Sold", "Idle (hari)", "Estimasi Hari", "Tanggal Habis"]
    lines = data.map((r) => csvEncode([r.sku, r.product_name, r.on_hand, r.available, r.qty_sold, r.avg_per_day, r.last_sold, r.days_idle, r.days_to_out, r.estimated_date]))
  } else {
    const data = rows as MonitorStockRow[]
    header = ["SKU", "Produk", "On Hand", "On Order", "Tersedia", "Perlu Restock"]
    lines = data.map((r) => csvEncode([r.sku, r.product_name, r.on_hand, r.on_order, r.available, r.qty_to_restock]))
  }

  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const AUTO_REFRESH_OPTIONS = [
  { value: "0", label: "Mati" },
  { value: "30", label: "30 detik" },
  { value: "60", label: "1 menit" },
  { value: "300", label: "5 menit" },
]

export function MonitorStokView() {
  const [tab, setTab] = useState<MonitorTab>("stok-kosong")
  const [subMode, setSubMode] = useState<OutOfStockMode>("habis")
  const [period, setPeriod] = useState<number>(90)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [locationId, setLocationId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)

  const resetPage = useCallback(() => setPage(1), [])

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim())
      resetPage()
    }, 300)
    return () => clearTimeout(t)
  }, [search, resetPage])

  const baseFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      location_id: locationId || undefined,
      category_id: categoryId || undefined,
    }),
    [debouncedSearch, locationId, categoryId]
  )

  const listParams = useMemo(
    () => ({ ...baseFilters, page, per_page: perPage }),
    [baseFilters, page, perPage]
  )

  const analyticsParams = useMemo(() => {
    const base = { ...baseFilters, page, per_page: perPage }
    if (tab === "perkiraan-habis") return { ...base, window: 30, threshold: period }
    return { ...base, days: period }
  }, [baseFilters, page, perPage, tab, period])

  const syncParams = useMemo(
    () => ({ search: debouncedSearch || undefined, page, per_page: perPage }),
    [debouncedSearch, page, perPage]
  )

  const listQuery = useMonitorList(tab, subMode, listParams)
  const analyticsQuery = useMonitorAnalytics(tab, analyticsParams)
  const failedSyncQuery = useFailedSync(tab, syncParams)
  const { data: summary } = useMonitorSummary(baseFilters)
  const { data: locData } = useLocations({ perPage: 100 })
  const { data: categoryTree } = useEnabledCategories()

  const active = isSyncTab(tab) ? failedSyncQuery : isAnalyticsTab(tab) ? analyticsQuery : listQuery
  const rows = active.data?.items ?? []
  const meta = active.data?.meta ?? EMPTY_META

  const locationOptions = useMemo(
    () => [
      { value: "", label: "Semua Lokasi" },
      ...(locData?.items ?? []).map((l) => ({ value: l.id, label: l.locationName })),
    ],
    [locData]
  )

  const categoryOptions = useMemo(
    () => [{ value: "", label: "Semua Kategori" }, ...flattenCategories(categoryTree ?? [])],
    [categoryTree]
  )

  const locationLabel = useMemo(() => {
    if (!locationId) return "Semua Lokasi"
    return (locData?.items ?? []).find((l) => l.id === locationId)?.locationName ?? "—"
  }, [locationId, locData])

  const changeTab = useCallback((t: MonitorTab) => {
    setTab(t)
    if (isAnalyticsTab(t)) setPeriod(PERIOD_DEFAULT[t] ?? 30)
    resetPage()
  }, [resetPage])

  const changeSub = useCallback((m: OutOfStockMode) => {
    setSubMode(m)
    resetPage()
  }, [resetPage])

  const onFilter = useCallback((fn: () => void) => {
    fn()
    resetPage()
  }, [resetPage])

  const autoRefreshRef = useRef(active)
  autoRefreshRef.current = active
  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => autoRefreshRef.current.refetch(), autoRefresh * 1000)
    return () => clearInterval(id)
  }, [autoRefresh])

  const hasFilter = Boolean(locationId || categoryId)
  const activeCount = [locationId, categoryId].filter(Boolean).length

  const subTotal = (key: OutOfStockMode): number | undefined => {
    if (!summary) return undefined
    return key === "habis" ? summary.habis : key === "minus" ? summary.minus : summary.dipesan
  }

  const totalBadge = tab === "stok-kosong" ? subTotal(subMode) : meta.total

  return (
    <div className="flex flex-col gap-4">
      {/* Header actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => exportTabCsv(tab, rows, subMode)}
          disabled={rows.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <DownloadIcon className="h-4 w-4" /> Export
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAutoRefresh((v) => (v ? 0 : 60))}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              autoRefresh ? "border-primary/40 bg-primary/10 text-primary" : "border-border/60 text-foreground hover:bg-muted"
            )}
            title={autoRefresh ? `Auto-refresh setiap ${autoRefresh}s` : "Auto-refresh mati"}
          >
            {autoRefresh ? <TimerIcon className="h-4 w-4" /> : <TimerOffIcon className="h-4 w-4" />}
            {autoRefresh ? `${autoRefresh}s` : "Auto"}
          </button>
          {autoRefresh > 0 && (
            <Combobox
              options={AUTO_REFRESH_OPTIONS.filter((o) => o.value !== "0")}
              value={String(autoRefresh)}
              onChange={(v) => setAutoRefresh(Number(v) || 0)}
              placeholder="Interval"
              searchPlaceholder="Pilih interval"
              className="h-9 w-28 bg-background"
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => active.refetch()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <RefreshCwIcon className={cn("h-4 w-4", active.isFetching && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/40 pb-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => changeTab(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              tab === key ? "bg-foreground text-background shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        {/* Sub-tabs Stok Kosong / Periode analitik + Total */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 sm:px-5">
          {tab === "stok-kosong" ? (
            <div className="flex flex-wrap gap-1.5">
              {SUB_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => changeSub(key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    subMode === key ? "border-primary text-primary" : "border-border/60 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {label}
                  {subTotal(key) !== undefined && (
                    <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums">{subTotal(key)}</span>
                  )}
                </button>
              ))}
            </div>
          ) : isAnalyticsTab(tab) ? (
            <div className="w-52">
              <Combobox
                options={PERIOD_OPTIONS[tab] ?? []}
                value={String(period)}
                onChange={(v) => onFilter(() => setPeriod(Number(v) || PERIOD_DEFAULT[tab]))}
                placeholder="Periode"
                searchPlaceholder="Pilih periode"
                className="h-9 bg-background"
              />
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Total <Badge variant="secondary" className="tabular-nums">{totalBadge ?? meta.total}</Badge>
          </div>
        </div>

        {isSyncTab(tab) ? (
          <>
            <FilterToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Cari produk (SKU / nama)..."
              align="end"
              hasFilter={false}
              activeCount={0}
              gridCols={3}
            >
              <div />
              <div />
              <div />
            </FilterToolbar>

            <div className="px-4 py-3 sm:px-5">
              <MonitorSyncFailedTable
                rows={failedSyncQuery.data?.items ?? []}
                meta={failedSyncQuery.data?.meta ?? EMPTY_META}
                isLoading={failedSyncQuery.isLoading}
                isFetching={failedSyncQuery.isFetching && !failedSyncQuery.isLoading}
                onPageChange={setPage}
                onPerPageChange={(s) => { setPerPage(s); resetPage() }}
              />
            </div>
          </>
        ) : (
          <>
            <FilterToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Cari produk (SKU / nama)..."
              align="end"
              onReset={hasFilter ? () => onFilter(() => { setLocationId(""); setCategoryId("") }) : undefined}
              hasFilter={hasFilter}
              activeCount={activeCount}
              gridCols={2}
            >
              <Combobox
                options={locationOptions}
                value={locationId}
                onChange={(v) => onFilter(() => setLocationId(v ?? ""))}
                placeholder="Lokasi"
                searchPlaceholder="Cari lokasi"
                className="h-9 bg-background"
              />
              <Combobox
                options={categoryOptions}
                value={categoryId}
                onChange={(v) => onFilter(() => setCategoryId(v ?? ""))}
                placeholder="Kategori"
                searchPlaceholder="Cari kategori"
                className="h-9 bg-background"
              />
            </FilterToolbar>

            <div className="px-4 py-3 sm:px-5">
              {isStockTab(tab) ? (
                <MonitorStockTable
                  rows={listQuery.data?.items ?? []}
                  meta={listQuery.data?.meta ?? EMPTY_META}
                  isLoading={listQuery.isLoading}
                  isFetching={listQuery.isFetching && !listQuery.isLoading}
                  locationLabel={locationLabel}
                  showRestock={tab === "menipis"}
                  emptyText={
                    tab === "menipis"
                      ? "Tidak ada produk menipis."
                      : tab === "sedang-dibeli"
                        ? "Tidak ada produk yang sedang dibeli."
                        : "Tidak ada produk pada kategori ini."
                  }
                  onPageChange={setPage}
                  onPerPageChange={(s) => { setPerPage(s); resetPage() }}
                />
              ) : (
                <MonitorAnalyticsTable
                  kind={tab as AnalyticsKind}
                  rows={analyticsQuery.data?.items ?? []}
                  meta={analyticsQuery.data?.meta ?? EMPTY_META}
                  isLoading={analyticsQuery.isLoading}
                  isFetching={analyticsQuery.isFetching && !analyticsQuery.isLoading}
                  emptyText={
                    tab === "tidak-laku"
                      ? "Tidak ada produk tidak laku pada periode ini."
                      : tab === "paling-laku"
                        ? "Belum ada penjualan pada periode ini."
                        : "Tidak ada produk yang diperkirakan habis pada periode ini."
                  }
                  onPageChange={setPage}
                  onPerPageChange={(s) => { setPerPage(s); resetPage() }}
                />
              )}
            </div>
          </>
        )}
      </LiquidGlass>
    </div>
  )
}
