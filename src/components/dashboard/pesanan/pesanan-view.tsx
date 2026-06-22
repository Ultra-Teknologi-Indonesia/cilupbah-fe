"use client"

import { useState, useMemo, useCallback } from "react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { useOrders } from "@/hooks/pesanan/use-orders"
import type { OrderTab, OrderListParams } from "@/types/pesanan/order"

import { OrderStatusTabs } from "./order-status-tabs"
import { OrderFilters, EMPTY_FILTERS, type FilterState } from "./order-filters"
import { OrderCardList } from "./order-card-list"

export function PesananView() {
  const [tab, setTab] = useState<OrderTab>("all")
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(12)

  const resetPage = useCallback(() => setPage(1), [])

  const handleTabChange = useCallback((t: OrderTab) => {
    setTab(t)
    resetPage()
  }, [resetPage])

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
    q: query || undefined,
    channel: filters.channel || undefined,
    store_id: filters.store_id || undefined,
    location_id: filters.location_id || undefined,
    content_type: (filters.content_type as OrderListParams["content_type"]) || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    page,
    per_page: perPage,
  }), [tab, query, filters, page, perPage])

  const { data, isLoading, isFetching } = useOrders(params)

  const orders = data?.data ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

  return (
    <div className="flex flex-col gap-4">
      <OrderStatusTabs active={tab} onChange={handleTabChange} />

      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <OrderFilters
          query={query}
          onQueryChange={handleQueryChange}
          filters={filters}
          onChange={handleFilterChange}
        />

        <div className="px-4 py-4 sm:px-5">
          <OrderCardList
            orders={orders}
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
    </div>
  )
}
