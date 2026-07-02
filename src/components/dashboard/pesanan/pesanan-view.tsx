"use client"

import { useState, useMemo, useCallback, useEffect } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { useOrders } from "@/hooks/pesanan/use-orders"
import { useUrlTab } from "@/hooks/use-url-tab"
import type { OrderTab, OrderListParams, SubFilter } from "@/types/pesanan/order"
import { SUB_PILL_CONFIG, TABS_WITH_ACTIONS, TAB_CONFIG } from "@/types/pesanan/order"

import { OrderStatusTabs, OrderSubStatusPills } from "./order-status-tabs"
import { OrderFilters, EMPTY_FILTERS, type FilterState } from "./order-filters"
import { OrderCardList } from "./order-card-list"
import { BulkActionBar } from "./bulk-action-bar"

const TAB_KEYS = TAB_CONFIG.map((t) => t.key as OrderTab)

export function PesananView() {
  // Tab & sub-status hidup di URL (?tab=&sub=) — bertahan saat refresh/back
  // dan bisa dibagikan sebagai link (pola sama dengan Proses Pesanan).
  const [tab, setTabUrl] = useUrlTab<OrderTab>("tab", "all", {
    validValues: TAB_KEYS,
    clearKeys: ["sub"],
  })
  const subKeys = useMemo(
    () => (SUB_PILL_CONFIG[tab] ?? []).map((p) => p.key),
    [tab]
  )
  const [subValue, setSubUrl] = useUrlTab("sub", "", { validValues: subKeys })
  const subFilter: SubFilter = (subValue || null) as SubFilter

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(12)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const resetPage = useCallback(() => setPage(1), [])
  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const handleTabChange = useCallback((t: OrderTab) => {
    setTabUrl(t)
    resetPage()
    clearSelection()
  }, [setTabUrl, resetPage, clearSelection])

  const handleSubFilterChange = useCallback((s: SubFilter) => {
    setSubUrl(s ?? "")
    resetPage()
    clearSelection()
  }, [setSubUrl, resetPage, clearSelection])

  // Ketikan pencarian responsif seketika di input, tapi hanya di-commit ke
  // params (yang memicu fetch) setelah jeda 350ms — 1 request per jeda ketik,
  // bukan 1 per karakter. Reset halaman ikut di-debounce agar tidak ada
  // refetch dini dengan query lama.
  const handleQueryChange = useCallback((v: string) => {
    setQuery(v)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query)
      resetPage()
    }, 350)
    return () => clearTimeout(t)
  }, [query, resetPage])

  const handleFilterChange = useCallback((f: FilterState) => {
    setFilters(f)
    resetPage()
  }, [resetPage])

  const params = useMemo<OrderListParams>(() => ({
    tab,
    sub: subFilter || undefined,
    q: debouncedQuery || undefined,
    channel: filters.channel || undefined,
    store_id: filters.store_id || undefined,
    location_id: filters.location_id || undefined,
    content_type: (filters.content_type as OrderListParams["content_type"]) || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    page,
    per_page: perPage,
  }), [tab, subFilter, debouncedQuery, filters, page, perPage])

  const { data, isLoading, isFetching } = useOrders(params)

  const orders = data?.data ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

  const selectable = TABS_WITH_ACTIONS.has(tab)
  const allSelected = selectable && orders.length > 0 && orders.every((o) => selectedIds.has(o.id))
  const someSelected = selectable && orders.some((o) => selectedIds.has(o.id))

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)))
    }
  }, [allSelected, orders])

  const selectAllCheckbox = selectable ? (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={allSelected ? true : someSelected ? "indeterminate" : false}
        onCheckedChange={toggleAll}
      />
      <span className="text-sm text-muted-foreground">
        {allSelected ? "Batalkan" : "Pilih semua"}
      </span>
    </div>
  ) : null

  const tabLabel = TAB_CONFIG.find((t) => t.key === tab)?.label ?? ""
  const hasSubPills = !!SUB_PILL_CONFIG[tab]

  return (
    <div className="flex flex-col gap-4">
      <OrderStatusTabs active={tab} onChange={handleTabChange} />

      <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h2 className="text-base font-medium">{tabLabel}</h2>
            {hasSubPills && (
              <div className="mt-3">
                <OrderSubStatusPills
                  active={tab}
                  subFilter={subFilter}
                  onSubFilterChange={handleSubFilterChange}
                />
              </div>
            )}
          </div>
        </div>

        <OrderFilters
          query={query}
          onQueryChange={handleQueryChange}
          filters={filters}
          onChange={handleFilterChange}
          leading={selectAllCheckbox}
        />

        <div className="px-4 py-4 sm:px-5">
          <OrderCardList
            orders={orders}
            tab={tab}
            subFilter={subFilter}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            isLoading={isLoading}
            page={meta.current_page}
            lastPage={meta.last_page}
            total={meta.total}
            perPage={meta.per_page}
            onPageChange={setPage}
            onPerPageChange={(s) => { setPerPage(s); resetPage() }}
            isFetching={isFetching}
          />
        </div>
      </LiquidGlass>

      <BulkActionBar
        tab={tab}
        subFilter={subFilter}
        count={selectedIds.size}
        onClear={clearSelection}
      />
    </div>
  )
}
