"use client"

import { SearchXIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination, GRID_PAGE_SIZES } from "@/components/ui/simple-pagination"
import { OrderCard } from "./order-card"
import type { Order, OrderTab, SubFilter } from "@/types/pesanan/order"
import { TABS_WITH_ACTIONS } from "@/types/pesanan/order"

interface OrderCardListProps {
  orders: Order[]
  tab: OrderTab
  subFilter: SubFilter
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  isLoading: boolean
  page: number
  lastPage: number
  total: number
  perPage: number
  onPageChange: (p: number) => void
  onPerPageChange: (s: number) => void
  isFetching?: boolean
}

export function OrderCardList({
  orders,
  tab,
  subFilter,
  selectedIds,
  onSelectionChange,
  isLoading,
  page,
  lastPage,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
  isFetching,
}: OrderCardListProps) {
  const selectable = TABS_WITH_ACTIONS.has(tab)

  function toggleOne(id: string, checked: boolean) {
    const next = new Set(selectedIds)
    if (checked) {
      next.add(id)
    } else {
      next.delete(id)
    }
    onSelectionChange(next)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16">
        <SearchXIcon className="size-8 text-muted-foreground" />
        <p className="font-medium">Tidak ada pesanan</p>
        <p className="text-sm text-muted-foreground">
          Coba ubah tab, pencarian, atau filter.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            tab={tab}
            subFilter={subFilter}
            selected={selectable ? selectedIds.has(order.id) : undefined}
            onSelectedChange={selectable ? (v) => toggleOne(order.id, !!v) : undefined}
          />
        ))}
      </div>

      <SimplePagination
        page={page}
        lastPage={lastPage}
        onPageChange={onPageChange}
        perPage={perPage}
        onPerPageChange={onPerPageChange}
        pageSizeOptions={GRID_PAGE_SIZES}
        isFetching={isFetching}
        label="pesanan"
        total={total}
      />
    </div>
  )
}
