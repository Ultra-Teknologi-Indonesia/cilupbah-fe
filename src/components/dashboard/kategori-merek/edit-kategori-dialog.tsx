"use client"

import * as React from "react"
import {
  ChevronRightIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useUpdateKategori,
  useEnabledCategories,
} from "@/hooks/kategori-merek/use-kategori"
import type { KategoriItem } from "@/types/kategori-merek/kategori"

function findNode(nodes: KategoriItem[], id: number): KategoriItem | undefined {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children?.length) {
      const found = findNode(n.children, id)
      if (found) return found
    }
  }
}

function buildPathIds(tree: KategoriItem[], targetId: number): number[] {
  const walk = (nodes: KategoriItem[], trail: number[]): number[] | null => {
    for (const n of nodes) {
      const current = [...trail, n.id]
      if (n.id === targetId) return current
      if (n.children?.length) {
        const found = walk(n.children, current)
        if (found) return found
      }
    }
    return null
  }
  return walk(tree, []) ?? []
}

function ReadOnlyColumn({
  label,
  nodes,
  activeId,
}: {
  label: string
  nodes: KategoriItem[]
  activeId?: number
}) {
  return (
    <div className="flex min-h-[180px] flex-col">
      <div className="px-3 pb-1.5 pt-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <ScrollArea className="flex-1">
        {nodes.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            —
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5 p-1.5 pt-0">
            {nodes.map((n) => (
              <li key={n.id}>
                <div
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm",
                    n.id === activeId
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <span className="truncate">{n.name}</span>
                  {n.children?.length ? (
                    <ChevronRightIcon className="size-4 shrink-0 opacity-50" />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  )
}

interface EditKategoriDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId: number | null
  currentName: string
  fullPath: string
}

export function EditKategoriDialog({
  open,
  onOpenChange,
  categoryId,
  currentName,
  fullPath,
}: EditKategoriDialogProps) {
  const [name, setName] = React.useState(currentName)
  const updateMut = useUpdateKategori()
  const { data: tree } = useEnabledCategories()

  React.useEffect(() => {
    if (open) setName(currentName)
  }, [open, currentName])

  const pathIds = React.useMemo(() => {
    if (!tree || !categoryId) return []
    return buildPathIds(tree, categoryId)
  }, [tree, categoryId])

  const resolved = React.useMemo(() => {
    if (!tree) return []
    return pathIds
      .map((id) => findNode(tree, id))
      .filter((n): n is KategoriItem => n !== undefined)
  }, [tree, pathIds])

  const columns: KategoriItem[][] = [
    tree ?? [],
    resolved[0]?.children ?? [],
    resolved[1]?.children ?? [],
  ]

  const parentSegments = resolved.slice(0, -1)
  const parentLabel = parentSegments.map((p) => p.name).join(" / ")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !categoryId) return
    if (trimmed === currentName) {
      onOpenChange(false)
      return
    }
    updateMut.mutate(
      { id: categoryId, name: trimmed },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={updateMut.isPending ? undefined : onOpenChange}
    >
      <DialogContent
        showCloseButton={false}
        className="border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-2xl"
      >
        <LiquidGlass
          radius={28}
          intensity="strong"
          className="bg-white/85 dark:bg-neutral-900/85"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
            <div>
              <DialogTitle className="text-lg">Edit Kategori</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Ubah nama kategori.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Tutup">
                <XIcon className="size-4" />
              </Button>
            </DialogClose>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 px-5 py-4 sm:px-6">
              {/* Tree view — read-only, showing current location */}
              <div className="space-y-2">
                <Label>Lokasi</Label>
                <div className="grid grid-cols-1 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                  <ReadOnlyColumn
                    label="Level 1"
                    nodes={columns[0]}
                    activeId={pathIds[0]}
                  />
                  <ReadOnlyColumn
                    label="Level 2"
                    nodes={columns[1]}
                    activeId={pathIds[1]}
                  />
                  <ReadOnlyColumn
                    label="Level 3"
                    nodes={columns[2]}
                    activeId={pathIds[2]}
                  />
                </div>
              </div>

              {/* Inline name input */}
              <div className="space-y-2">
                <Label htmlFor="edit-kategori-name">Nama Kategori</Label>
                <div className="flex items-center gap-0 rounded-xl border border-border/60 bg-background/50 focus-within:ring-2 focus-within:ring-primary/30">
                  {parentLabel && (
                    <span className="shrink-0 pl-3 text-sm text-primary">
                      {parentLabel}{" / "}
                    </span>
                  )}
                  <input
                    id="edit-kategori-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama kategori"
                    autoFocus
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border/60 px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMut.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!name.trim() || updateMut.isPending}
              >
                {updateMut.isPending && <Loader2Icon className="animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </LiquidGlass>
      </DialogContent>
    </Dialog>
  )
}
