"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { LiquidGlass } from "@/components/ui/liquid-glass"

/**
 * Layout 2 kolom konsisten untuk semua tab Produk: panel filter di KIRI
 * (aside) + konten (tabel/grid) di kanan. Pola sama dengan Pantauan &
 * Download-Progress.
 */
export function FilterShell({
  filters,
  onReset,
  children,
  className,
}: {
  /** Kontrol filter (akan ditata vertikal di aside kiri). */
  filters: React.ReactNode
  /** Jika diisi, tampilkan tombol Reset di header panel. */
  onReset?: () => void
  /** Konten kanan (kartu/tabel + header-nya). */
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-5 lg:flex-row", className)}>
      <aside className="lg:w-64 lg:shrink-0">
        <LiquidGlass radius={20} intensity="subtle" className="bg-white/40 p-4 dark:bg-white/[0.06]">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium">Filter</span>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="text-sm font-medium text-destructive hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3">{filters}</div>
        </LiquidGlass>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
