"use client"

import { SearchXIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { OrderCard } from "./order-card"
import type { Order } from "@/types/pesanan/order"

interface OrderCardListProps {
  orders: Order[]
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
  isLoading,
  page,
  lastPage,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
  isFetching,
}: OrderCardListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16">
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      <SimplePagination
        page={page}
        lastPage={lastPage}
        onPageChange={onPageChange}
        perPage={perPage}
        onPerPageChange={onPerPageChange}
        pageSizeOptions={[12, 24, 48]}
        isFetching={isFetching}
        label="pesanan"
        total={total}
      />
    </div>
  )
}
