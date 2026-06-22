"use client"

import { cn } from "@/lib/utils"
import { useOrderCounts } from "@/hooks/pesanan/use-orders"
import { TAB_CONFIG, type OrderTab } from "@/types/pesanan/order"
import { Skeleton } from "@/components/ui/skeleton"

export function OrderStatusTabs({
  active,
  onChange,
}: {
  active: OrderTab
  onChange: (tab: OrderTab) => void
}) {
  const { data, isLoading } = useOrderCounts()
  const counts = data?.data

  return (
    <div className="flex flex-wrap gap-1.5">
      {TAB_CONFIG.map(({ key, label }) => {
        const count = counts?.[key as keyof typeof counts]
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key as OrderTab)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-foreground text-background shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {label}
            {isLoading ? (
              <Skeleton className="h-4 w-6 rounded-full" />
            ) : count != null ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  isActive ? "bg-background/20 text-background" : "bg-background text-muted-foreground"
                )}
              >
                {count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
