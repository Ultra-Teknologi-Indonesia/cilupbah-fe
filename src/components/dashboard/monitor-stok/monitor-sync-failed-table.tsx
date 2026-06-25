"use client"

import { useState } from "react"
import { PackageOpenIcon, RefreshCwIcon, CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useRetrySync, useRetryBulkSync } from "@/hooks/monitor-stok/use-monitor-stok"
import type { MonitorSyncFailedRow } from "@/types/monitor-stok/monitor"

interface PageMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface MonitorSyncFailedTableProps {
  rows: MonitorSyncFailedRow[]
  meta: PageMeta
  isLoading: boolean
  isFetching: boolean
  onPageChange: (page: number) => void
  onPerPageChange: (size: number) => void
}

function HeadSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-border/20 px-3 py-3.5">
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, j) => (
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

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="destructive" className="text-[10px] font-medium">
      {status === "failed" ? "Gagal" : status}
    </Badge>
  )
}

export function MonitorSyncFailedTable({
  rows,
  meta,
  isLoading,
  isFetching,
  onPageChange,
  onPerPageChange,
}: MonitorSyncFailedTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [retryId, setRetryId] = useState<string | null>(null)
  const [showBulk, setShowBulk] = useState(false)

  const retry = useRetrySync()
  const retryBulk = useRetryBulkSync()

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === rows.length) setSelected(new Set())
    else setSelected(new Set(rows.map((r) => r.id)))
  }

  const handleRetry = () => {
    if (!retryId) return
    retry.mutate(retryId, { onSettled: () => setRetryId(null) })
  }

  const handleBulk = () => {
    retryBulk.mutate([...selected], {
      onSettled: () => {
        setShowBulk(false)
        setSelected(new Set())
      },
    })
  }

  if (isLoading) return <HeadSkeleton />

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <CheckIcon className="h-10 w-10" />
        <p className="text-sm font-medium">Tidak ada mapping gagal sync.</p>
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

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-muted/60 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selected.size} dipilih
          </span>
          <button
            type="button"
            onClick={() => setShowBulk(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCwIcon className="h-3.5 w-3.5" /> Retry Semua
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Batal
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={selected.size === rows.length && rows.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-border"
                />
              </th>
              {["Produk", "Channel / Toko", "Status", "Error", "Terakhir Sync", ""].map((h, i) => (
                <th
                  key={h || `action-${i}`}
                  className={cn(
                    "whitespace-nowrap px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                    i === 0 ? "text-left" : i === 5 ? "text-center" : "text-left"
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    className="h-4 w-4 rounded border-border"
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Thumb url={row.thumbnail} alt={row.product_name ?? row.sku ?? "—"} />
                    <div className="min-w-0">
                      <p className="truncate font-medium" title={row.product_name ?? ""}>
                        {row.product_name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">{row.sku ?? "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium">{row.channel_name ?? "—"}</span>
                    <span className="text-xs text-muted-foreground">{row.shop_name ?? "—"}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <StatusBadge status={row.sync_status} />
                </td>
                <td className="max-w-[200px] px-3 py-3">
                  <p className="truncate text-xs text-red-600 dark:text-red-400" title={row.error_message ?? ""}>
                    {row.error_message ?? "—"}
                  </p>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">
                  {row.last_synced_at
                    ? new Date(row.last_synced_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => setRetryId(row.id)}
                    disabled={retry.isPending}
                    className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    <RefreshCwIcon className="h-3 w-3" /> Retry
                  </button>
                </td>
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
        label="mapping"
      />

      <ConfirmDialog
        open={retryId !== null}
        onOpenChange={(o) => { if (!o) setRetryId(null) }}
        title="Retry Sinkronisasi"
        description="Mapping ini akan dijadwalkan ulang untuk sinkronisasi ke channel. Lanjutkan?"
        confirmLabel="Retry"
        onConfirm={handleRetry}
        loading={retry.isPending}
      />

      <ConfirmDialog
        open={showBulk}
        onOpenChange={setShowBulk}
        title="Retry Semua yang Dipilih"
        description={`${selected.size} mapping akan dijadwalkan ulang untuk sinkronisasi. Lanjutkan?`}
        confirmLabel="Retry Semua"
        onConfirm={handleBulk}
        loading={retryBulk.isPending}
      />
    </div>
  )
}
