"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MaximizeIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface PreviewToolbarProps {
  pageNumber: number
  numPages: number
  scale: number
  onPageChange: (n: number) => void
  onScaleChange: (s: number) => void
  onFit: () => void
}

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3]

function clampScale(s: number) {
  return Math.min(3, Math.max(0.25, s))
}

export function PreviewToolbar({
  pageNumber,
  numPages,
  scale,
  onPageChange,
  onScaleChange,
  onFit,
}: PreviewToolbarProps) {
  const canPrev = pageNumber > 1
  const canNext = pageNumber < numPages

  const zoomOut = () => {
    const below = [...ZOOM_STEPS].reverse().find((z) => z < scale - 0.001)
    onScaleChange(clampScale(below ?? scale - 0.25))
  }
  const zoomIn = () => {
    const above = ZOOM_STEPS.find((z) => z > scale + 0.001)
    onScaleChange(clampScale(above ?? scale + 0.25))
  }

  return (
    <div
      className={cn(
        "sticky top-[64px] z-30 flex flex-wrap items-center justify-center gap-3 border-b border-border/60",
        "bg-background/80 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      )}
    >
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!canPrev}
          onClick={() => onPageChange(pageNumber - 1)}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <div className="min-w-[88px] text-center text-xs font-medium tabular-nums text-muted-foreground">
          Hal. {pageNumber} / {numPages || "—"}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!canNext}
          onClick={() => onPageChange(pageNumber + 1)}
          aria-label="Halaman berikutnya"
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="hidden h-5 w-px bg-border sm:block" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={zoomOut}
          aria-label="Perkecil"
          disabled={scale <= 0.25}
        >
          <MinusIcon className="size-4" />
        </Button>
        <div className="min-w-[52px] text-center text-xs font-medium tabular-nums text-muted-foreground">
          {Math.round(scale * 100)}%
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={zoomIn}
          aria-label="Perbesar"
          disabled={scale >= 3}
        >
          <PlusIcon className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={onFit}
          aria-label="Pas ke layar"
        >
          <MaximizeIcon className="size-3.5" />
          Fit
        </Button>
      </div>
    </div>
  )
}
