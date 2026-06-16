"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatIDR } from "../product-columns"
import { useProductPriceBook } from "@/hooks/master-produk/use-product-tabs"
import { TabPagination } from "./tab-pagination"

const CUSTOMER_TYPE_LABEL: Record<string, string> = {
  retail: "Ritel",
  reseller: "Reseller",
  wholesaler: "Grosir",
  wholesale: "Grosir",
  distributor: "Distributor",
}

function SortHeader({
  label,
  field,
  sort,
  onSort,
  align = "left",
}: {
  label: string
  field: string
  sort: string
  onSort: (s: string) => void
  align?: "left" | "right" | "center"
}) {
  const active = sort === field || sort === `-${field}`
  const desc = sort === `-${field}`
  return (
    <th
      className={cn(
        "px-3 py-2.5 text-xs font-medium text-muted-foreground",
        align === "right" && "text-right",
        align === "center" && "text-center"
      )}
      aria-sort={active ? (desc ? "descending" : "ascending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(active && !desc ? `-${field}` : field)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          align === "right" && "flex-row-reverse",
          active && "text-foreground"
        )}
      >
        {label}
        {!active ? (
          <ArrowUpDownIcon className="size-3 opacity-50" />
        ) : desc ? (
          <ArrowDownIcon className="size-3" />
        ) : (
          <ArrowUpIcon className="size-3" />
        )}
      </button>
    </th>
  )
}

export function TabBukuHarga({ productId }: { productId: string }) {
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(10)
  const [sort, setSort] = React.useState("")

  const { data, isLoading, isError, refetch, isFetching } = useProductPriceBook(
    productId,
    { page, perPage, sort: sort || undefined },
    true
  )
  const rows = data?.items ?? []
  const lastPage = data?.meta?.last_page ?? 1

  const onSort = (s: string) => {
    setSort(s)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40 text-left">
              <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">SKU</th>
              <SortHeader label="Tipe pelanggan" field="customer_type" sort={sort} onSort={onSort} />
              <SortHeader label="Min qty" field="min_qty" sort={sort} onSort={onSort} align="right" />
              <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Max qty</th>
              <SortHeader label="Harga" field="price" sort={sort} onSort={onSort} align="right" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td colSpan={5} className="px-3 py-3">
                    <div className="h-5 w-full animate-pulse rounded bg-muted/60" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Gagal memuat.{" "}
                  <button className="font-medium text-primary hover:underline" onClick={() => refetch()}>
                    Coba lagi
                  </button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Belum ada harga grosir.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-mono text-xs text-primary">{r.sku ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    {r.customerType
                      ? CUSTOMER_TYPE_LABEL[r.customerType] ?? r.customerType
                      : "Semua"}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{r.minQty ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {r.maxQty ?? <span className="text-muted-foreground">∞</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium tabular-nums">{formatIDR(r.price)}</td>
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
