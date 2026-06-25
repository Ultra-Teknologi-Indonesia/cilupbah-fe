"use client"

import { PackageOpenIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import type { MonitorStockRow } from "@/types/monitor-stok/monitor"

interface PageMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface MonitorStockTableProps {
  rows: MonitorStockRow[]
  meta: PageMeta
  isLoading: boolean
  isFetching: boolean
  locationLabel: string
  showRestock?: boolean
  emptyText?: string
  onPageChange: (page: number) => void
  onPerPageChange: (size: number) => void
}

function HeadSkeleton({ cols }: { cols: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="border-b border-border/20 px-3 py-3.5">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Thumb({ url, alt }: { url: string | null; alt: string }) {
  return (
    <div
      className="h-9 w-9 shrink-0 rounded-md border border-border/40 bg-muted/40 bg-cover bg-center"
      role="img"
      aria-label={alt}
      style={url ? { backgroundImage: `url(${url})` } : undefined}
    />
  )
}

export function MonitorStockTable({
  rows,
  meta,
  isLoading,
  isFetching,
  locationLabel,
  showRestock = false,
  emptyText = "Tidak ada produk pada kategori ini.",
  onPageChange,
  onPerPageChange,
}: MonitorStockTableProps) {
  const cols = showRestock ? 6 : 5

  if (isLoading) {
    return <HeadSkeleton cols={cols} />
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <PackageOpenIcon className="h-10 w-10" />
        <p className="text-sm font-medium">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {isFetching && (
        <div className="flex justify-center py-0.5">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-border/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              {["Produk", "Lokasi", "On Hand", "On Order", "Tersedia", ...(showRestock ? ["Perlu Restock"] : [])].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    "whitespace-nowrap px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                    i === 0 ? "text-left" : "text-right"
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.item_id} className="border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Thumb url={row.thumbnail} alt={row.product_name ?? row.sku} />
                    <div className="min-w-0">
                      <p className="truncate font-medium" title={row.product_name ?? ""}>
                        {row.product_name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">{row.sku}</p>
                      {row.variation_values.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {row.variation_values.map((v, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] font-normal">
                              {v.value}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-muted-foreground">{locationLabel}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">{row.on_hand}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">{row.on_order}</td>
                <td className={cn("whitespace-nowrap px-3 py-3 text-right tabular-nums font-medium", row.available <= 0 ? "text-red-600 dark:text-red-400" : "")}>
                  {row.available}
                </td>
                {showRestock && (
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                    {row.qty_to_restock}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SimplePagination
        page={meta.current_page}
        lastPage={meta.last_page}
        onPageChange={onPageChange}
        perPage={meta.per_page}
        onPerPageChange={onPerPageChange}
        pageSizeOptions={[15, 30, 50]}
        total={meta.total}
        label="produk"
      />
    </div>
  )
}
