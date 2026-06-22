"use client"

import * as React from "react"
import {
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ImageIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { formatIDR } from "../product-columns"
import { useProductVariants, useBulkVariants } from "@/hooks/master-produk/use-product-tabs"
import type { BulkVariantAction } from "@/services/master-produk/product-tabs.service"

type SortCol = "sku" | "sell_price" | "stock"
const PAGE_SIZES = [10, 20, 50, 100]

function SortHeader({
  label,
  col,
  sort,
  onSort,
  align = "left",
}: {
  label: string
  col: SortCol
  sort: { col: SortCol; dir: "asc" | "desc" }
  onSort: (col: SortCol) => void
  align?: "left" | "right"
}) {
  const activeCol = sort.col === col
  const ariaSort = activeCol ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
  return (
    <th
      aria-sort={ariaSort}
      className={cn("px-3 py-2.5", align === "right" && "text-right")}
    >
      <button
        type="button"
        onClick={() => onSort(col)}
        className={cn(
          "inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground",
          align === "right" && "flex-row-reverse"
        )}
      >
        {label}
        {!activeCol ? (
          <ArrowUpDownIcon className="size-3 opacity-50" />
        ) : sort.dir === "asc" ? (
          <ArrowUpIcon className="size-3" />
        ) : (
          <ArrowDownIcon className="size-3" />
        )}
      </button>
    </th>
  )
}

export function TabVariasi({ productId }: { productId: string }) {
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<{ col: SortCol; dir: "asc" | "desc" }>({
    col: "sku",
    dir: "asc",
  })
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(10)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  
  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const sortParam = `${sort.dir === "desc" ? "-" : ""}${sort.col}`
  const { data, isLoading, isError, refetch, isFetching } = useProductVariants(
    productId,
    { page, perPage, search, sort: sortParam },
    true
  )
  const bulk = useBulkVariants(productId)

  const rows = data?.items ?? []
  const meta = data?.meta
  const total = meta?.total ?? 0
  const lastPage = meta?.last_page ?? 1

  const onSort = (col: SortCol) => {
    setSort((s) => (s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" }))
    setPage(1)
  }

  const pageIds = rows.map((r) => r.id)
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allOnPageSelected) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
  }
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const runBulk = (action: BulkVariantAction) => {
    const ids = [...selected]
    if (ids.length === 0) return
    if (action === "delete" && !window.confirm(`Hapus ${ids.length} varian terpilih?`)) return

    bulk.mutate(
      { action, variant_ids: ids },
      {
        onSuccess: (res) => {
          const blocked = res.data?.blocked ?? []
          if (action === "delete" && blocked.length) {
            toast.warning(`Sebagian dilewati (terpakai): ${blocked.join(", ")}`)
          } else {
            toast.success("Varian diperbarui.")
          }
          setSelected(new Set())
        },
        onError: (err) => {
          const body = err as { message?: string }
          toast.error(body?.message || "Aksi gagal")
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-xs flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari SKU…"
            className="h-9 pl-8"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Total <span className="font-semibold text-foreground tabular-nums">{total}</span> varian
        </div>
      </div>

      {}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
          <span className="font-medium">{selected.size} dipilih</span>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={bulk.isPending} onClick={() => runBulk("delete")}
              className="text-destructive hover:text-destructive">
              <Trash2Icon /> Hapus
            </Button>
          </div>
        </div>
      )}

      {}
      <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Pilih semua"
                  className="size-4 cursor-pointer accent-primary"
                  checked={allOnPageSelected}
                  onChange={toggleAll}
                />
              </th>
              <SortHeader label="SKU" col="sku" sort={sort} onSort={onSort} />
              <th className="px-3 py-2.5">Opsi</th>
              <SortHeader label="Harga jual" col="sell_price" sort={sort} onSort={onSort} />
              <SortHeader label="Stok" col="stock" sort={sort} onSort={onSort} align="right" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td colSpan={5} className="px-3 py-3">
                    <div className="h-5 w-full animate-pulse rounded bg-muted/60" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Gagal memuat varian.{" "}
                  <button className="font-medium text-primary hover:underline" onClick={() => refetch()}>
                    Coba lagi
                  </button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  {search ? "Tidak ada varian yang cocok." : "Belum ada varian."}
                </td>
              </tr>
            ) : (
              rows.map((v) => (
                <tr key={v.id} className={cn("border-b border-border/40 last:border-0 hover:bg-muted/30", selected.has(v.id) && "bg-primary/5")}>
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      aria-label={`Pilih ${v.sku}`}
                      className="size-4 cursor-pointer accent-primary"
                      checked={selected.has(v.id)}
                      onChange={() => toggleOne(v.id)}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/40">
                        {v.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.image} alt={v.sku} className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <ImageIcon className="size-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-primary">{v.sku}</div>
                        {v.barcode && <div className="font-mono text-[11px] text-muted-foreground">{v.barcode}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {v.options.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        v.options.map((o, i) => (
                          <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground/80">
                            {o.value}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">{formatIDR(v.sellPrice)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{new Intl.NumberFormat("id-ID").format(v.stock)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SimplePagination
        page={page}
        lastPage={lastPage}
        onPageChange={setPage}
        perPage={perPage}
        onPerPageChange={setPerPage}
        pageSizeOptions={PAGE_SIZES}
        total={total}
        label="varian"
        isFetching={isFetching}
      />
    </div>
  )
}
