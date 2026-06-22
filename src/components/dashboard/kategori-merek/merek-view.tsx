"use client"

import * as React from "react"
import {
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { SimplePagination } from "@/components/ui/simple-pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { TambahMerekDialog } from "./tambah-merek-dialog"
import { EditMerekDialog } from "./edit-merek-dialog"
import { useBrands, useDeleteBrand } from "@/hooks/kategori-merek/use-brand"
import type { BrandItem } from "@/types/kategori-merek/brand"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

export function MerekView() {
  const [tambahOpen, setTambahOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(10)
  const [deleteTarget, setDeleteTarget] = React.useState<BrandItem | null>(null)
  const [editTarget, setEditTarget] = React.useState<BrandItem | null>(null)

  const deleteMut = useDeleteBrand()

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isError } = useBrands({
    search: debouncedSearch || undefined,
    page,
    perPage,
  })

  const items = data?.items ?? []
  const total = data?.meta?.total ?? 0
  const lastPage = data?.meta?.last_page ?? 1

  function handleDelete() {
    if (!deleteTarget) return
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button variant="primary" size="sm" className="h-8 gap-1.5" onClick={() => setTambahOpen(true)}>
          <PlusIcon className="size-4" />
          Tambah Merek
        </Button>
      </div>

      <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 pt-3 pb-3 sm:px-5">
          <div className="text-sm font-medium">Daftar Merek</div>
          <div className="relative w-full sm:w-64">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari merek…"
              className="h-9 border-border bg-background pl-9 pr-8"
            />
            {search.length > 0 && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Bersihkan pencarian"
                className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-5 sm:px-5">
          <div className="flex items-center justify-end pb-3 text-sm text-muted-foreground">
            Total <span className="ml-2 font-medium text-foreground tabular-nums">{total}</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" /> Memuat merek…
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-sm text-destructive">
              Gagal memuat data merek.
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {debouncedSearch ? "Tidak ditemukan merek." : "Belum ada merek. Tambah merek baru."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[300px]">Nama Merek</TableHead>
                  <TableHead className="w-48">Tanggal Dibuat</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-sm font-medium">{item.name}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => setEditTarget(item)}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && !isError && (
            <SimplePagination
              page={page}
              lastPage={lastPage}
              onPageChange={setPage}
              perPage={perPage}
              onPerPageChange={setPerPage}
              pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
              total={total}
              label="merek"
            />
          )}
        </div>
      </LiquidGlass>

      <TambahMerekDialog open={tambahOpen} onOpenChange={setTambahOpen} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Hapus Merek"
        description={`Yakin ingin menghapus merek "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan. Merek yang masih digunakan oleh produk tidak bisa dihapus.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
      />

      <EditMerekDialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null)
        }}
        brandId={editTarget?.id ?? null}
        currentName={editTarget?.name ?? ""}
      />
    </>
  )
}
