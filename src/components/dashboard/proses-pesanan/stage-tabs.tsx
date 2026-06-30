"use client"

import { cn } from "@/lib/utils"
import { STAGE_CONFIG, type FulfillmentStage } from "@/types/proses-pesanan/fulfillment"

export function StageTabs({
  active,
  onChange,
}: {
  active: FulfillmentStage
  onChange: (stage: FulfillmentStage) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {STAGE_CONFIG.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              isActive
                ? "bg-foreground text-background shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
