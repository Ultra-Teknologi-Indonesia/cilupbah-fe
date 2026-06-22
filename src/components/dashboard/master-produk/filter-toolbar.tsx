"use client"

import * as React from "react"
import { FilterIcon, SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function FilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Cari…",
  onReset,
  hasFilter,
  activeCount = 0,
  align = "start",
  leading,
  gridCols = 3,
  children,
  className,
}: {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  onReset?: () => void
  hasFilter?: boolean
  activeCount?: number
  align?: "start" | "end"
  leading?: React.ReactNode
  gridCols?: 2 | 3
  children?: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const hasChildren = React.Children.count(children) > 0
  const filterCount = activeCount > 0 ? activeCount : undefined

  return (
    <div className={cn("border-b border-border/40", className)}>
      <div className={cn(
        "flex flex-wrap items-center gap-2 px-4 py-2.5 sm:px-5",
        align === "end" && "justify-end"
      )}>
        {leading}
        {onSearchChange != null && (
          <div className="relative w-full sm:w-auto sm:min-w-[200px]">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 rounded-full bg-background pl-9 pr-8"
            />
            {(search?.length ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Bersihkan pencarian"
                className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>
        )}

        {hasChildren && (
          <Button
            variant={open ? "secondary" : "outline"}
            size="sm"
            className={cn(
              "h-9 gap-2 rounded-full transition-colors",
              open && "bg-primary/10 text-primary hover:bg-primary/15",
              !open && filterCount && "border-primary/40 text-primary"
            )}
            onClick={() => setOpen(!open)}
          >
            <FilterIcon className="size-4" />
            Filter
            {filterCount && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {filterCount}
              </span>
            )}
          </Button>
        )}

        {hasFilter && onReset && (
          <button
            type="button"
            onClick={() => {
              onReset()
              setOpen(false)
            }}
            className="ml-auto flex items-center gap-1 text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
          >
            <XIcon className="size-3.5" />
            Reset
          </button>
        )}
      </div>

      {hasChildren && (
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 sm:px-5">
              <div className={cn("grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2", gridCols === 3 && "lg:grid-cols-3")}>
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
