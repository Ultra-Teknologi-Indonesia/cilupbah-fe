"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

// Pill-tab standar dashboard — satu sumber gaya untuk semua baris tab
// (sebelumnya tiap halaman merakit pill sendiri, AUDIT-FE.md §5.4). Dua
// varian: "solid" (tab utama, latar foreground saat aktif) dan "soft"
// (sub-tab, latar tipis saat aktif).

export interface PillTabItem<T extends string = string> {
  key: T
  label: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  /** Angka badge; null/undefined = tanpa badge. */
  count?: number | null
  /** true = badge skeleton (count sedang dimuat). */
  countLoading?: boolean
}

export function PillTab<T extends string>({
  item,
  active,
  variant = "solid",
  onSelect,
}: {
  item: PillTabItem<T>
  active: boolean
  variant?: "solid" | "soft"
  onSelect: (key: T) => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={() => onSelect(item.key)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
        variant === "solid" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs",
        active
          ? variant === "solid"
            ? "bg-foreground text-background shadow-sm"
            : "bg-foreground/10 text-foreground"
          : variant === "solid"
            ? "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {item.label}
      {item.countLoading ? (
        <Skeleton className="h-4 w-6 rounded-full" />
      ) : item.count != null ? (
        <span
          className={cn(
            "rounded-full px-1.5 text-xs tabular-nums",
            active && variant === "solid"
              ? "bg-background/20 text-background"
              : "bg-background text-muted-foreground"
          )}
        >
          {item.count}
        </span>
      ) : null}
    </button>
  )
}

export function PillTabs<T extends string>({
  items,
  active,
  onSelect,
  variant = "solid",
  className,
}: {
  items: PillTabItem<T>[]
  active: T | null
  onSelect: (key: T) => void
  variant?: "solid" | "soft"
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {items.map((item) => (
        <PillTab
          key={item.key}
          item={item}
          active={active === item.key}
          variant={variant}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
