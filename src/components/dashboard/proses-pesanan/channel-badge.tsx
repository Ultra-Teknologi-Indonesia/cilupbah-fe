"use client"

import { cn } from "@/lib/utils"
import { CHANNEL_MAP, STATUS_LABELS } from "@/types/pesanan/order"

export function ChannelBadge({ source }: { source: string | null }) {
  if (!source) return <span className="text-muted-foreground">—</span>
  const ch = CHANNEL_MAP[source]
  if (!ch) return <span className="text-sm">{source}</span>
  return (
    <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: ch.color }}>
      <span
        aria-hidden
        className="size-4 shrink-0"
        style={{
          backgroundColor: ch.color,
          WebkitMaskImage: `url(/channels/${source}.svg)`,
          maskImage: `url(/channels/${source}.svg)`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
      {ch.label}
    </span>
  )
}

export function OrderStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>
  const s = STATUS_LABELS[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        s?.className ?? "border-border bg-muted text-muted-foreground"
      )}
    >
      {s?.label ?? status}
    </span>
  )
}
