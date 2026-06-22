"use client"

import { cn } from "@/lib/utils"
import { useOrderCounts } from "@/hooks/pesanan/use-orders"
import { TAB_CONFIG, SUB_PILL_CONFIG, type OrderTab, type SubFilter } from "@/types/pesanan/order"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export function OrderStatusTabs({
  active,
  onChange,
  subFilter,
  onSubFilterChange,
}: {
  active: OrderTab
  onChange: (tab: OrderTab) => void
  subFilter: SubFilter
  onSubFilterChange: (sub: SubFilter) => void
}) {
  const { data, isLoading } = useOrderCounts()
  const counts = data?.data

  const zones = ["lifecycle", "problem", "admin"] as const
  const grouped = zones.map((z) => TAB_CONFIG.filter((t) => t.zone === z))

  const subPills = SUB_PILL_CONFIG[active]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {grouped.map((tabs, zi) => (
          <div key={zi} className="contents">
            {zi > 0 && (
              <Separator orientation="vertical" className="!h-6 mx-1" />
            )}
            {tabs.map(({ key, label }) => {
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
        ))}
      </div>

      {subPills && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSubFilterChange(null)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              subFilter === null
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            Semua
          </button>
          {subPills.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onSubFilterChange(key as SubFilter)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                subFilter === key
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
