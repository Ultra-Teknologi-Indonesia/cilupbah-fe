"use client"

import { cn } from "@/lib/utils"
import type { StageSub } from "@/types/proses-pesanan/fulfillment"

export function SubStatusPills({
  subs,
  active,
  onChange,
  counts,
}: {
  subs: StageSub[]
  active: string | null
  onChange: (sub: string) => void
  counts?: Record<string, number | undefined>
}) {
  if (!subs.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {subs.map(({ key, label }) => {
        const isActive = active === key
        const count = counts?.[key]
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {label}
            {count != null && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
