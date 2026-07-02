"use client"

import * as React from "react"
import {
  PackageCheckIcon,
  RefreshCwIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { SimplePagination } from "@/components/ui/simple-pagination"
import {
  FulfillmentFilterBar,
  type FulfillmentFilterField,
  type FulfillmentFilterValue,
} from "@/components/dashboard/proses-pesanan/shared/fulfillment-filter-bar"
import { OrderCard } from "@/components/dashboard/pesanan/order-card"
import type { OrderTab } from "@/types/pesanan/order"
import { useOrdersByStage } from "@/hooks/proses-pesanan/use-fulfillment"
import { fulfillmentToOrder } from "@/lib/proses-pesanan/order-card-mapper"
import { cn } from "@/lib/utils"

export function FulfillmentCardList({
  stage,
  tab = "all",
  emptyTitle = "Belum ada pesanan",
  emptyDescription = "Pesanan akan muncul di sini.",
  filterFields,
  statusOptions,
  channelStatusOptions,
  courierMode,
  excludeTransit,
}: {
  stage: string
  tab?: OrderTab
  emptyTitle?: string
  emptyDescription?: string
  filterFields?: FulfillmentFilterField[]
  statusOptions?: { value: string; label: string }[]
  channelStatusOptions?: { value: string; label: string }[]
  courierMode?: "shipping_provider" | "courier_code"
  excludeTransit?: boolean
}) {
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(20)
  const [filter, setFilter] = React.useState<FulfillmentFilterValue>({})

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = React.useMemo(
    () => ({
      q: debounced || undefined,
      page,
      per_page: perPage,
      shipping_provider: filter.shipping_provider,
      courier_code: filter.courier_code,
      location_id: filter.location_id,
      source: filter.source,
      channel_shop_id: filter.channel_shop_id,
      label_printed: filter.label_printed as "yes" | "no" | undefined,
      date_from: filter.date_from,
      date_to: filter.date_to,
      payment: filter.payment as "cod" | "noncod" | undefined,
      courier_type: filter.courier_type as "instant" | "regular" | undefined,
      shipment_type: filter.shipment_type,
      status: filter.status,
      channel_status: filter.channel_status,
      exclude_transit: excludeTransit ? ("1" as const) : undefined,
    }),
    [debounced, page, perPage, filter, excludeTransit]
  )

  const { data, isLoading, isFetching, refetch } = useOrdersByStage(stage, params)
  const orders = React.useMemo(() => data?.items ?? [], [data])
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

  const mappedOrders = React.useMemo(
    () => orders.map((o) => ({ raw: o, ui: fulfillmentToOrder(o) })),
    [orders]
  )

  return (
    <div>
      {/* Toolbar */}
      <FulfillmentFilterBar
        value={filter}
        onChange={(v) => {
          setFilter(v)
          setPage(1)
        }}
        fields={filterFields ?? []}
        statusOptions={statusOptions}
        channelStatusOptions={channelStatusOptions}
        courierMode={courierMode}
        excludeTransit={excludeTransit}
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="Cari no. pesanan…"
      />
      <div className="flex items-center justify-end gap-3 border-b border-border/40 px-4 py-2 text-sm text-muted-foreground sm:px-5">
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-full p-1.5 transition-colors hover:bg-muted"
          aria-label="Muat ulang"
        >
          <RefreshCwIcon className={cn("size-4", isFetching && "animate-spin")} />
        </button>
        <span className="flex items-center gap-1.5">
          Total <Badge>{meta.total}</Badge>
        </span>
      </div>

      {/* List */}
      <div className="px-4 pb-4 sm:px-5">
        {isLoading ? (
          <div className="flex flex-col gap-3 py-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-xl border border-border/60 bg-muted/30"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted/60">
              <PackageCheckIcon className="size-8 text-muted-foreground/70" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{emptyTitle}</p>
              <p className="text-xs text-muted-foreground">{emptyDescription}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            {mappedOrders.map(({ raw, ui }) => (
              <OrderCard
                key={raw.id}
                order={ui}
                tab={tab}
                variant="sales"
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <SimplePagination
          page={meta.current_page}
          lastPage={meta.last_page}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={(s) => {
            setPerPage(s)
            setPage(1)
          }}
          pageSizeOptions={[10, 20, 50]}
          isFetching={isFetching}
          label="pesanan"
          total={meta.total}
        />
      </div>
    </div>
  )
}
