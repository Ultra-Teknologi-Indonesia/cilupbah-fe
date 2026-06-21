"use client"

import * as React from "react"
import { FilterIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function FilterShell({
  open,
  onOpenChange,
  activeCount = 0,
  onReset,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeCount?: number
  onReset?: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("border-b border-border/40", className)}>
      <div className="flex items-center justify-between px-4 py-2 sm:px-5">
        <Button
          variant={open ? "secondary" : "outline"}
          size="sm"
          className={cn(
            "h-9 gap-2 rounded-full transition-colors",
            open && "bg-primary/10 text-primary hover:bg-primary/15",
            !open && activeCount > 0 && "border-primary/40 text-primary"
          )}
          onClick={() => onOpenChange(!open)}
        >
          <FilterIcon className="size-4" />
          Filter
          {activeCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>

        {activeCount > 0 && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
          >
            <XIcon className="size-3.5" />
            Reset filter
          </button>
        )}
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 sm:px-5">
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
