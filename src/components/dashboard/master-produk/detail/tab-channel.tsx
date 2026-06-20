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
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2.5">SKU</th>
              <th className="px-3 py-2.5">Opsi</th>
              <th className="px-3 py-2.5">Listing channel</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td colSpan={3} className="px-3 py-3">
                    <div className="h-5 w-full animate-pulse rounded bg-muted/60" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={3} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Gagal memuat.{" "}
                  <button className="font-medium text-primary hover:underline" onClick={() => refetch()}>
                    Coba lagi
                  </button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Belum ada listing channel.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.variantId} className="border-b border-border/40 last:border-0 align-top hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-mono text-xs text-primary">{r.sku}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {r.options.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        r.options.map((o, i) => (
                          <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground/80">
                            {o.value}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {r.listings.map((l, i) => (
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TabPagination
        page={page}
        perPage={perPage}
        lastPage={lastPage}
        isFetching={isFetching}
        onPage={(p) => setPage(Math.max(1, Math.min(lastPage, p)))}
        onPerPage={(n) => {
          setPerPage(n)
          setPage(1)
        }}
      />
    </div>
  )
}
