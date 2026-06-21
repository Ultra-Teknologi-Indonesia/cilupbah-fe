"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatIDR } from "../product-columns"
import { useProductChannelPrices } from "@/hooks/master-produk/use-product-tabs"
import { TabPagination } from "./tab-pagination"

export function TabHargaChannel({ productId }: { productId: string }) {
  const [view, setView] = React.useState<"daftar" | "matriks">("daftar")
  const [channel, setChannel] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(10)

  const { data, isLoading, isError, refetch, isFetching } = useProductChannelPrices(
    productId,
    { page, perPage, channel: channel || undefined },
    true
  )
  const rows = React.useMemo(() => data?.items ?? [], [data])
  const meta = data?.meta
  const lastPage = meta?.last_page ?? 1

  const channelOptions = React.useMemo(() => {
    const s = new Set<string>()
    rows.forEach((r) =>
      r.prices.forEach((p) => {
        if (p.channelCode) s.add(p.channelCode)
      })
    )
    return [...s]
  }, [rows])

  
  const stores = React.useMemo(() => {
    const m = new Map<string, string>()
    rows.forEach((r) =>
      r.prices.forEach((p) => {
        const key = p.channelShopId ?? p.channelCode ?? ""
        if (key) m.set(key, p.shopName ?? p.channelCode ?? key)
      })
    )
    return [...m.entries()]
  }, [rows])

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-border/60 p-0.5">
          {(["daftar", "matriks"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium capitalize transition",
                view === v ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <Select
          value={channel || "all"}
          onValueChange={(val) => {
            setChannel(val === "all" ? "" : val)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Semua channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua channel</SelectItem>
            {channelOptions.map((code) => (
              <SelectItem key={code} value={code}>
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {toolbar}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded bg-muted/60" />
          ))}
        </div>
      </div>
    )
  }
  if (isError) {
    return (
      <div className="flex flex-col gap-3">
        {toolbar}
        <p className="px-3 py-10 text-center text-sm text-muted-foreground">
          Gagal memuat.{" "}
          <button className="font-medium text-primary hover:underline" onClick={() => refetch()}>
            Coba lagi
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {toolbar}

      {rows.length === 0 ? (
        <p className="px-3 py-10 text-center text-sm text-muted-foreground">Belum ada harga channel.</p>
      ) : view === "matriks" ? (
        <>
          {/* Desktop: table matrix */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-border/60 bg-card">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2.5">Produk</th>
                  <th className="px-3 py-2.5 text-right">Internal</th>
                  {stores.map(([key, name]) => (
                    <th key={key} className="px-3 py-2.5 text-right">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.variantId} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                    <td className="sticky left-0 z-10 bg-card px-3 py-2.5 font-mono text-xs text-primary">{r.sku}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatIDR(r.internalPrice)}</td>
                    {stores.map(([key]) => {
                      const cell = r.prices.find((p) => (p.channelShopId ?? p.channelCode) === key)
                      return (
                        <td key={key} className="px-3 py-2.5 text-right tabular-nums">
                          {cell ? formatIDR(cell.price) : <span className="text-muted-foreground">—</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile: stacked card layout */}
          <div className="flex flex-col gap-3 sm:hidden">
            {rows.map((r) => (
              <div key={r.variantId} className="rounded-lg border border-border/60 bg-card p-3">
                <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 mb-2">
                  <span className="font-mono text-xs text-primary truncate">{r.sku}</span>
                  <span className="text-sm font-medium tabular-nums">{formatIDR(r.internalPrice)}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {stores.map(([key, name]) => {
                    const cell = r.prices.find((p) => (p.channelShopId ?? p.channelCode) === key)
                    return (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="truncate text-muted-foreground">{name}</span>
                        <span className="tabular-nums font-medium">
                          {cell ? formatIDR(cell.price) : <span className="text-muted-foreground">—</span>}
                        </span>
                      </div>
                    )
                  })}
                  {stores.length === 0 && (
                    <span className="text-xs text-muted-foreground">Belum ada harga channel</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Desktop: table list */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-border/60 bg-card">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2.5">SKU</th>
                  <th className="px-3 py-2.5 text-right">Harga internal</th>
                  <th className="px-3 py-2.5">Harga per toko</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.variantId} className="border-b border-border/40 last:border-0 align-top hover:bg-muted/30">
                    <td className="px-3 py-2.5 font-mono text-xs text-primary">{r.sku}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatIDR(r.internalPrice)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        {r.prices.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Belum di-set</span>
                        ) : (
                          r.prices.map((p, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2 py-1 text-xs">
                              <span className="truncate max-w-[140px] text-muted-foreground">{p.shopName ?? p.channelCode}</span>
                              <span className="font-medium tabular-nums">{formatIDR(p.price)}</span>
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile: stacked card layout */}
          <div className="flex flex-col gap-3 sm:hidden">
            {rows.map((r) => (
              <div key={r.variantId} className="rounded-lg border border-border/60 bg-card p-3">
                <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 mb-2">
                  <span className="font-mono text-xs text-primary truncate">{r.sku}</span>
                  <span className="text-sm font-medium tabular-nums">{formatIDR(r.internalPrice)}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {r.prices.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Belum di-set</span>
                  ) : (
                    r.prices.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="truncate max-w-[60%] text-muted-foreground">{p.shopName ?? p.channelCode}</span>
                        <span className="font-medium tabular-nums">{formatIDR(p.price)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
