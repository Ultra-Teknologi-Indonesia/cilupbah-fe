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
    <div className="flex flex-wrap items-center gap-1 border-b border-border">
      {STAGE_CONFIG.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            {isActive && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}
