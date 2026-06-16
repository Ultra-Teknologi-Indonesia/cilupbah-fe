"use client"

import { cn } from "@/lib/utils"

export type DetailTab = { id: string; label: string }

/** Tab bar sticky (liquid glass) — scrollable di layar sempit; sinkron URL diatur parent. */
export function DetailTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: DetailTab[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="sticky top-0 z-20 -mx-1 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div
        role="tablist"
        aria-label="Detail produk"
        className="flex gap-1 overflow-x-auto px-1 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active === t.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
