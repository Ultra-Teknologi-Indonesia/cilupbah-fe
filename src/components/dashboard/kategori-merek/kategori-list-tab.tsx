"use client"

import * as React from "react"
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  useEnabledCategories,
  useDeleteKategori,
  useDisableKategori,
  useUpdateKategori,
} from "@/hooks/kategori-merek/use-kategori"
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

function InlineEditCell({
  item,
}: {
  item: FlatKategori
}) {
  const [editing, setEditing] = React.useState(false)
  const [value, setValue] = React.useState(item.name)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const updateMut = useUpdateKategori()

  React.useEffect(() => {
    if (editing) {
      setValue(item.name)
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }, [editing, item.name])

  const save = () => {
    const trimmed = value.trim()
    if (!trimmed || trimmed === item.name) {
      setEditing(false)
      return
    }
    updateMut.mutate(
      { id: item.id, name: trimmed },
      { onSuccess: () => setEditing(false) },
    )
  }

  const cancel = () => {
    setValue(item.name)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save()
            if (e.key === "Escape") cancel()
          }}
          disabled={updateMut.isPending}
          className="h-8 min-w-0 flex-1 rounded-lg border border-primary/40 bg-background px-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
        {updateMut.isPending ? (
          <Loader2Icon className="size-4 animate-spin text-primary" />
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-primary hover:text-primary"
              onClick={save}
            >
              <CheckIcon className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={cancel}
            >
              <XIcon className="size-3.5" />
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-2">
      <span className="text-sm text-primary">{item.fullPath}</span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted/60 hover:text-foreground group-hover:opacity-100"
        aria-label={`Edit ${item.name}`}
      >
        <PencilIcon className="size-3.5" />
      </button>
    </div>
  )
}

const PER_PAGE = 20

export function KategoriListTab({ search }: { search: string }) {
  const [page, setPage] = React.useState(1)
  const [deleteTarget, setDeleteTarget] = React.useState<FlatKategori | null>(null)

  const { data: tree, isLoading, isError } = useEnabledCategories()
  const deleteMut = useDeleteKategori()
  const disableMut = useDisableKategori()

  const prevSearch = React.useRef(search)
  if (prevSearch.current !== search) {
    prevSearch.current = search
    if (page !== 1) setPage(1)
  }

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

  return (
    <>
      <div className="flex items-center justify-end pb-3 text-sm text-muted-foreground">
        Total <span className="ml-2 font-medium text-foreground tabular-nums">{total}</span>
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
                  <InlineEditCell item={item} />
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
        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
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
    </>
  )
}
