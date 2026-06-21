"use client"

import * as React from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export function FilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Cari…",
  onReset,
  hasFilter,
  children,
  className,
}: {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  onReset?: () => void
  hasFilter?: boolean
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-border/40 px-4 py-2.5 sm:px-5",
        className
      )}
    >
      {onSearchChange != null && (
        <div className="relative w-full sm:w-auto sm:min-w-[200px]">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 rounded-full border-transparent bg-input/50 pl-9 pr-8"
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
      {children}
      {hasFilter && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="ml-auto text-sm font-medium text-destructive hover:underline"
        >
          Reset
        </button>
      )}
    </div>
  )
}
