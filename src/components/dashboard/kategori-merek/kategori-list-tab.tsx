"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FilterShell } from "@/components/dashboard/master-produk/filter-shell"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useEnabledCategories, useDeleteKategori, useDisableKategori } from "@/hooks/kategori-merek/use-kategori"
import type { KategoriItem, FlatKategori } from "@/types/kategori-merek/kategori"

function flattenTree(
  nodes: KategoriItem[],
  parents: string[] = []
): FlatKategori[] {
  const result: FlatKategori[] = []
  for (const node of nodes) {
    const path = [...parents, node.name]
    result.push({
      id: node.id,
      name: node.name,
      fullPath: path.join(" > "),
      isLeaf: node.is_leaf,
      hasChildren: Boolean(node.children?.length),
      source: node.source,
      isEnabled: node.is_enabled,
    })
    if (node.children?.length) {
      result.push(...flattenTree(node.children, path))
    }
  }
  return result
}

const PER_PAGE = 20

export function KategoriListTab() {
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [deleteTarget, setDeleteTarget] = React.useState<FlatKategori | null>(null)

  const { data: tree, isLoading, isError } = useEnabledCategories()
  const deleteMut = useDeleteKategori()
  const disableMut = useDisableKategori()

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const flat = React.useMemo(() => flattenTree(tree ?? []), [tree])

  const filtered = React.useMemo(() => {
    if (!search) return flat
    const q = search.toLowerCase()
    return flat.filter((f) => f.fullPath.toLowerCase().includes(q))
  }, [flat, search])

  const total = filtered.length
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleDelete() {
    if (!deleteTarget) return
    if (deleteTarget.source === "system") {
      disableMut.mutate([deleteTarget.id], {
        onSuccess: () => setDeleteTarget(null),
      })
    } else {
      deleteMut.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      })
    }
  }

  const resetFilter = () => {
    setSearchInput("")
    setSearch("")
    setPage(1)
  }

  return (
    <FilterShell
      filters={
        <>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari kategori"
              className="pl-9"
            />
          </div>
          <Button variant="primary" size="sm" className="w-full" onClick={() => setSearch(searchInput.trim())}>
            Terapkan
          </Button>
        </>
      }
      onReset={searchInput ? resetFilter : undefined}
    >
      <LiquidGlass radius={24} className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex items-center justify-end px-5 py-3 text-sm text-muted-foreground">
          Total <Badge className="ml-2">{total}</Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" /> Memuat kategori…
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-destructive">
            Gagal memuat data kategori.
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {search ? "Tidak ditemukan kategori." : "Belum ada kategori. Import dari sistem atau tambah baru."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[300px]">Nama Kategori</TableHead>
                <TableHead className="w-32 text-center">Sub-kategori</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="text-sm text-primary">{item.fullPath}</span>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {item.hasChildren ? "Ya" : "Tidak"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!isLoading && !isError && total > PER_PAGE && (
          <div className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-3">
            <span className="text-sm text-muted-foreground">
              Halaman {page} dari {lastPage}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeftIcon /> Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya <ChevronRightIcon />
              </Button>
            </div>
          </div>
        )}
      </LiquidGlass>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={deleteTarget?.source === "system" ? "Nonaktifkan Kategori" : "Hapus Kategori"}
        description={
          deleteTarget?.source === "system"
            ? `Yakin ingin menonaktifkan "${deleteTarget?.fullPath}"? Kategori sistem tidak bisa dihapus, hanya dinonaktifkan.`
            : `Yakin ingin menghapus "${deleteTarget?.fullPath}"? Tindakan ini tidak dapat dibatalkan.`
        }
        confirmLabel={deleteTarget?.source === "system" ? "Nonaktifkan" : "Hapus"}
        variant="destructive"
        loading={deleteMut.isPending || disableMut.isPending}
        onConfirm={handleDelete}
      />
    </FilterShell>
  )
}
