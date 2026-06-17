"use client"

import * as React from "react"
import { ArchiveIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  useArchivedProducts,
  useRestoreProduct,
} from "@/hooks/master-produk/use-archived-products"
import type { ArchivedProduct } from "@/types/master-produk"
import { FilterShell } from "../filter-shell"
import { ArchiveTable } from "./archive-table"

export function ArchiveView() {
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, isError, refetch } = useArchivedProducts({
    search: debounced || undefined,
    page,
    perPage: 20,
  })
  const restore = useRestoreProduct()
  const pendingId = restore.isPending ? restore.variables ?? null : null

  const meta = data?.meta
  const items = data?.items ?? []

  const filters = (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama / SKU…"
        className="h-9 rounded-lg pl-9"
      />
    </div>
  )

  return (
    <FilterShell filters={filters} onReset={search ? () => setSearch("") : undefined}>
      <LiquidGlass
        radius={24}
        intensity="default"
        className="flex flex-col gap-4 bg-white/40 p-5 dark:bg-white/[0.06] sm:p-6"
      >
      {isLoading ? (
        <div className="space-y-2 rounded-2xl border border-border/60 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <p className="text-sm font-medium">Gagal memuat arsip</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-14 text-center">
          <ArchiveIcon className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">Belum ada produk diarsipkan</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Produk yang Anda arsipkan dari halaman detail akan muncul di sini.
          </p>
        </div>
      ) : (
        <>
          <ArchiveTable
            items={items}
            pendingId={pendingId}
            onRestore={(item: ArchivedProduct) => restore.mutate(item.itemGroupId)}
          />
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-end gap-3 text-sm">
              <span className="text-muted-foreground">
                Halaman {meta.current_page} dari {meta.last_page}
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Sebelumnya"
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Berikutnya"
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      </LiquidGlass>
    </FilterShell>
  )
}
