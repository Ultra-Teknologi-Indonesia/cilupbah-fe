"use client"

import { useState, useMemo, useCallback } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { useOrders } from "@/hooks/pesanan/use-orders"
import type { OrderTab, OrderListParams, SubFilter } from "@/types/pesanan/order"
import { SUB_PILL_CONFIG, TABS_WITH_ACTIONS } from "@/types/pesanan/order"

import { OrderStatusTabs } from "./order-status-tabs"
import { OrderFilters, EMPTY_FILTERS, type FilterState } from "./order-filters"
import { OrderCardList } from "./order-card-list"
import { BulkActionBar } from "./bulk-action-bar"

export function PesananView() {
  const [tab, setTab] = useState<OrderTab>("all")
  const [subFilter, setSubFilter] = useState<SubFilter>(null)
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(12)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const resetPage = useCallback(() => setPage(1), [])
  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const handleTabChange = useCallback((t: OrderTab) => {
    setTab(t)
    setSubFilter(null)
    resetPage()
    clearSelection()
  }, [resetPage, clearSelection])

  const handleSubFilterChange = useCallback((s: SubFilter) => {
    setSubFilter(s)
    resetPage()
    clearSelection()
  }, [resetPage, clearSelection])

  const handleQueryChange = useCallback((v: string) => {
    setQuery(v)
    resetPage()
  }, [resetPage])

  const handleFilterChange = useCallback((f: FilterState) => {
    setFilters(f)
    resetPage()
  }, [resetPage])

  const params = useMemo<OrderListParams>(() => ({
    tab,
    sub: subFilter || undefined,
    q: query || undefined,
    channel: filters.channel || undefined,
    store_id: filters.store_id || undefined,
    location_id: filters.location_id || undefined,
    content_type: (filters.content_type as OrderListParams["content_type"]) || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    page,
    per_page: perPage,
  }), [tab, subFilter, query, filters, page, perPage])

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

  return (
    <div className="flex flex-col gap-4">
      <OrderStatusTabs
        active={tab}
        onChange={handleTabChange}
        subFilter={subFilter}
        onSubFilterChange={handleSubFilterChange}
      />

      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
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
