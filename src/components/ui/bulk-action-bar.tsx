"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface BulkActionBarProps {
  count: number
  actions?: React.ReactNode
  onClear?: () => void
  label?: (count: number) => string
  message?: React.ReactNode
  className?: string
}

export function BulkActionBar({
  count,
  actions,
  onClear,
  label = (n) => `${n} dipilih`,
  message,
  className,
}: BulkActionBarProps) {
  if (count <= 0) return null

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-2.5 text-sm",
        className
      )}
    >
      <span className="font-medium">{label(count)}</span>
      {message}
      <div className="ml-auto flex items-center gap-2">
        {actions}
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Batal
          </button>
        )}
      </div>
    </div>
  )
}
