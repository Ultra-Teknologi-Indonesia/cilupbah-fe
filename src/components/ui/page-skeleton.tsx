"use client"

import { LiquidGlass } from "@/components/ui/liquid-glass"

export function PageHeaderSkeleton() {
  return (
    <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-sm text-transparent">Dashboard</span>
          <span className="text-sm text-transparent">/</span>
          <span className="text-sm text-transparent">Halaman</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-transparent">Judul Halaman Loading</h1>
            <p className="mt-0.5 text-sm text-transparent">Deskripsi halaman yang sedang dimuat saat ini.</p>
          </div>
        </div>
      </div>
    </LiquidGlass>
  )
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="h-9 w-64 rounded-md bg-transparent" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-transparent">Total 0</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-3 py-3">
                  <span className="text-transparent">Kolom Header</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b border-border/60">
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="px-3 py-2.5">
                    <span className="text-transparent">Data cell content</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 sm:px-5">
        <span className="text-xs text-transparent">Halaman 1 dari 1</span>
        <div className="flex gap-1.5">
          <div className="size-8 rounded-md bg-transparent" />
          <div className="size-8 rounded-md bg-transparent" />
        </div>
      </div>
    </LiquidGlass>
  )
}

export function TabBarSkeleton() {
  return (
    <LiquidGlass
      radius={16}
      intensity="subtle"
      showGlow={false}
      showShadow={false}
      reactive={false}
      className="w-fit max-w-full overflow-x-auto bg-white/50 p-1.5 dark:bg-white/[0.06]"
    >
      <div className="flex gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5 rounded-md px-3 py-1.5">
            <div className="size-4 rounded bg-transparent" />
            <span className="text-sm text-transparent">Tab Item</span>
          </div>
        ))}
      </div>
    </LiquidGlass>
  )
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <LiquidGlass key={i} radius={20} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
          <div className="p-6 pb-2">
            <span className="text-sm text-transparent">Metric Label</span>
          </div>
          <div className="p-6 pt-0">
            <span className="text-2xl font-bold text-transparent">123</span>
            <p className="text-xs text-transparent">+20.1% dari bulan lalu</p>
          </div>
        </LiquidGlass>
      ))}
    </div>
  )
}

export function FormSkeleton() {
  return (
    <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <span className="mb-2 block text-sm font-medium text-transparent">Label Field</span>
          <div className="h-10 w-full rounded-md bg-transparent" />
        </div>
        <div>
          <span className="mb-2 block text-sm font-medium text-transparent">Label Field</span>
          <div className="h-10 w-full rounded-md bg-transparent" />
        </div>
        <div>
          <span className="mb-2 block text-sm font-medium text-transparent">Label Field</span>
          <div className="h-24 w-full rounded-md bg-transparent" />
        </div>
        <div className="flex justify-end gap-3">
          <div className="h-10 w-24 rounded-md bg-transparent" />
          <div className="h-10 w-24 rounded-md bg-transparent" />
        </div>
      </div>
    </LiquidGlass>
  )
}

export function DetailSkeleton() {
  return (
    <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-lg bg-transparent" />
          <div>
            <span className="text-lg font-semibold text-transparent">Nama Produk Loading</span>
            <p className="text-sm text-transparent">SKU-PLACEHOLDER-001</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <span className="text-xs text-transparent">Label</span>
              <p className="text-sm text-transparent">Value content here</p>
            </div>
          ))}
        </div>
      </div>
    </LiquidGlass>
  )
}
