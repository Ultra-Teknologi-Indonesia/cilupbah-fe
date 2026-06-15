"use client"

import { cn } from "@/lib/utils"
import type { DetailChannelMapping } from "@/types/master-produk"

const SYNC_STYLE: Record<string, { cls: string; label: string }> = {
  synced: { cls: "text-emerald-600 dark:text-emerald-400", label: "Tersinkron" },
  success: { cls: "text-emerald-600 dark:text-emerald-400", label: "Tersinkron" },
  pending: { cls: "text-amber-600 dark:text-amber-400", label: "Menunggu" },
  failed: { cls: "text-destructive", label: "Gagal" },
  error: { cls: "text-destructive", label: "Gagal" },
}

const fmtDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(iso)) : "—"

export function ChannelListing({ mappings }: { mappings: DetailChannelMapping[] }) {
  if (mappings.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-muted-foreground">
        Belum terhubung ke channel mana pun.
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border/40">
      {mappings.map((m, i) => {
        const style = m.syncStatus ? SYNC_STYLE[m.syncStatus] : undefined
        return (
          <div key={i} className="flex items-center gap-3 py-2.5 text-sm">
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{m.shopName ?? "—"}</div>
              <div className="text-xs text-muted-foreground">
                {m.channelName ?? "—"} · sinkron {fmtDate(m.lastSyncedAt)}
              </div>
            </div>
            <span className={cn("shrink-0 text-xs", style?.cls ?? "text-muted-foreground")}>
              {style?.label ?? m.syncStatus ?? "—"}
            </span>
          </div>
        )
      })}
    </div>
  )
}
