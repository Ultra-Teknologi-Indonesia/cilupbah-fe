"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ExternalLinkIcon, ImageIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { RaiseProductDetail } from "@/hooks/master-produk/use-naikkan"
import { CountdownTimer } from "./countdown-timer"

function statusBadge(isActive: boolean) {
  if (isActive) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        Aktif
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      Nonaktif
    </span>
  )
}

function resultBadge(isSuccess: boolean | null) {
  if (isSuccess === null) return <span className="text-muted-foreground">—</span>
  if (isSuccess) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        Sukses
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
      Gagal
    </span>
  )
}

export function buildProdukColumns(opts: {
  onToggleRepeatable: (detail: RaiseProductDetail, value: boolean) => void
  onRemove: (detail: RaiseProductDetail) => void
}): ColumnDef<RaiseProductDetail>[] {
  return [
    {
      id: "product",
      header: "Produk",
      cell: ({ row }) => {
        const d = row.original
        const thumb = d.thumbnails.find(Boolean) ?? null
        const skuDisplay = d.itemCodes.length <= 2
          ? d.itemCodes.join(", ")
          : `${d.itemCodes.slice(0, 2).join(", ")} + ${d.itemCodes.length - 2} SKU lainnya`

        return (
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt={d.itemGroupName ?? ""} className="size-full object-cover" />
              ) : (
                <ImageIcon className="size-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="line-clamp-1 font-medium">{d.itemGroupName ?? "—"}</p>
              <p className="line-clamp-1 font-mono text-xs text-muted-foreground">
                {skuDisplay || "—"}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      id: "channel_url",
      header: "URL",
      cell: ({ row }) => {
        const url = row.original.channelUrl
        if (!url) return <span className="text-muted-foreground">—</span>
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLinkIcon className="size-3.5" />
            Lihat
          </a>
        )
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => statusBadge(row.original.isActive),
    },
    {
      id: "countdown",
      header: "Sisa Waktu",
      cell: ({ row }) => (
        <CountdownTimer
          startTime={row.original.startTime}
          endTime={row.original.endTime}
        />
      ),
    },
    {
      id: "repeatable",
      header: "Otomatis",
      cell: ({ row }) => {
        const d = row.original
        return (
          <Switch
            checked={d.isRepeatable}
            onCheckedChange={(checked) => opts.onToggleRepeatable(d, checked)}
          />
        )
      },
    },
    {
      id: "result",
      header: "Hasil",
      cell: ({ row }) => resultBadge(row.original.isSuccess),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-destructive hover:text-destructive"
          onClick={() => opts.onRemove(row.original)}
        >
          <Trash2Icon className="size-4" />
        </Button>
      ),
    },
  ]
}
