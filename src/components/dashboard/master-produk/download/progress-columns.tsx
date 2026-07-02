"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type {
  DownloadState,
  DownloadTransaction,
} from "@/hooks/master-produk/use-download"

const STATE_LABEL: Record<DownloadState, string> = {
  queued: "Menunggu",
  downloading: "Sedang berjalan",
  done: "Selesai",
  failed: "Gagal",
}

const STATE_BAR: Record<DownloadState, string> = {
  queued: "bg-amber-500",
  downloading: "bg-primary",
  done: "bg-emerald-500",
  failed: "bg-destructive",
}

const STATE_BADGE: Record<DownloadState, string> = {
  queued: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  downloading: "bg-primary/10 text-primary",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  failed: "bg-destructive/10 text-destructive",
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function buildProgressColumns(
  onOpen: (trx: DownloadTransaction) => void
): ColumnDef<DownloadTransaction>[] {
  return [
    {
      id: "trx_no",
      header: "No. Transaksi",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => onOpen(row.original)}
          className="font-medium text-primary hover:underline"
        >
          {row.original.trxNo}
        </button>
      ),
    },
    {
      id: "created_date",
      header: "Tanggal",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(row.original.createdDate)}
        </span>
      ),
    },
    {
      id: "executed_by",
      header: "Pengguna",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.executedBy || "system"}</span>
      ),
    },
    {
      id: "store",
      header: "Store",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.original.storeName ?? "—"}</span>
          {row.original.channelName && (
            <span className="text-xs text-muted-foreground">{row.original.channelName}</span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const { state, totalDownloaded, allProduct, progressPercent, errorMessage } = row.original
        const pct = Math.min(100, Math.max(0, progressPercent))
        return (
          <div className="flex min-w-40 flex-col gap-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <Badge variant="secondary" className={cn("px-1.5 py-0", STATE_BADGE[state])}>
                {STATE_LABEL[state]}
              </Badge>
              <span className="tabular-nums text-muted-foreground">
                {totalDownloaded}/{allProduct}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", STATE_BAR[state])}
                style={{ width: `${pct}%` }}
              />
            </div>
            {state === "failed" && errorMessage && (
              <span className="truncate text-xs text-destructive" title={errorMessage}>
                {errorMessage}
              </span>
            )}
          </div>
        )
      },
    },
  ]
}
