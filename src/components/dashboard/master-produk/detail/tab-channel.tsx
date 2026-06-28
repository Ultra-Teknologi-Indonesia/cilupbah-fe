"use client"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProductChannelListings } from "@/hooks/master-produk/use-product-tabs"
import { TabPagination, SyncStatusBadge } from "./tab-pagination"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import type { ChannelListingRow } from "@/services/master-produk/product-tabs.service"

export function TabChannel({ productId }: { productId: string }) {
  const [channel, setChannel] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(10)

  const { data, isLoading, isError, refetch, isFetching } = useProductChannelListings(
    productId,
    { page, perPage, channel: channel || undefined },
    true
  )
  const rows = React.useMemo(() => data?.items ?? [], [data])
  const meta = data?.meta
  const lastPage = meta?.last_page ?? 1
  const total = meta?.total ?? 0

  const channelOptions = React.useMemo(() => {
    const m = new Map<string, string>()
    rows.forEach((r) =>
      r.listings.forEach((l) => {
        if (l.channelCode) m.set(l.channelCode, l.channelName ?? l.channelCode)
      })
    )
    return [...m.entries()]
  }, [rows])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          value={channel || "all"}
          onValueChange={(v) => {
            setChannel(v === "all" ? "" : v)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-[200px]">
            <SelectValue placeholder="Semua channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua channel</SelectItem>
            {channelOptions.map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          Total <span className="font-semibold text-foreground tabular-nums">{total}</span> varian ter-listing
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
        <DataTable
          columns={React.useMemo<ColumnDef<ChannelListingRow>[]>(() => [
            {
              accessorKey: "sku",
              header: "SKU",
              cell: ({ row }) => <span className="font-mono text-xs text-primary">{row.original.sku}</span>,
            },
            {
              accessorKey: "options",
              header: "Opsi",
              cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                  {row.original.options.length === 0 ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : (
                    row.original.options.map((o, i) => (
                      <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground/80">
                        {o.value}
                      </span>
                    ))
                  )}
                </div>
              ),
            },
            {
              accessorKey: "listings",
              header: "Listing channel",
              cell: ({ row }) => (
                <div className="flex flex-wrap gap-1.5">
                  {row.original.listings.map((l, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2 py-1 text-xs"
                      title={l.channelName ?? undefined}
                    >
                      <span className="truncate max-w-[160px]">{l.shopName ?? l.channelCode}</span>
                      <SyncStatusBadge status={l.syncStatus} reason={l.errorMessage} />
                    </span>
                  ))}
                </div>
              ),
            },
          ], [])}
          data={rows}
          isLoading={isLoading}
          hideToolbar
          manualPagination
          pagination={{
            pageIndex: page - 1,
            pageSize: perPage,
          }}
          rowCount={total}
          onPaginationChange={(p) => {
            setPage(p.pageIndex + 1)
            setPerPage(p.pageSize)
          }}
          tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
          emptyState={
            isError ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Gagal memuat.{" "}
                <button className="font-medium text-primary hover:underline" onClick={() => refetch()}>
                  Coba lagi
                </button>
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Belum ada listing channel.
              </div>
            )
          }
        />
      </div>
    </div>
  )
}
