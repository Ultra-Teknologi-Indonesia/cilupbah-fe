"use client"

import { cn } from "@/lib/utils"
import type { StageSub } from "@/types/proses-pesanan/fulfillment"

export function SubStatusPills({
  subs,
  active,
  onChange,
}: {
  subs: StageSub[]
  active: string | null
  onChange: (sub: string) => void
}) {
  if (!subs.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {subs.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
