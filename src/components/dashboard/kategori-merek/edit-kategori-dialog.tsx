"use client"

import * as React from "react"
import {
  ChevronRightIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  useEnabledCategories,
  useUpdateKategori,
} from "@/hooks/kategori-merek/use-kategori"
import type { KategoriItem } from "@/types/kategori-merek/kategori"

function buildPath(tree: KategoriItem[], targetId: number): KategoriItem[] {
  const walk = (nodes: KategoriItem[], trail: KategoriItem[]): KategoriItem[] | null => {
    for (const n of nodes) {
      const current = [...trail, n]
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
  const { data: tree } = useEnabledCategories()
  const updateMut = useUpdateKategori()

  React.useEffect(() => {
    if (open) setName(currentName)
  }, [open, currentName])

  const { isRoot, trailIds, resolved, columns } = React.useMemo(() => {
    if (!tree || !categoryId)
      return { isRoot: true, trailIds: new Set<number>(), resolved: [] as KategoriItem[], columns: [[], [], []] as KategoriItem[][] }

    const trail = buildPath(tree, categoryId)
    if (trail.length <= 1)
      return { isRoot: true, trailIds: new Set<number>(), resolved: [] as KategoriItem[], columns: [tree, [], []] as KategoriItem[][] }

    const parentTrail = trail.slice(0, -1)
    return {
      isRoot: false,
      trailIds: new Set(trail.map((n) => n.id)),
      resolved: parentTrail,
      columns: [
        tree,
        parentTrail[0]?.children ?? [],
        parentTrail[1]?.children ?? [],
      ] as KategoriItem[][],
    }
  }, [tree, categoryId])

  const parentLabel = resolved.map((p) => p.name).join(" > ")

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
              {/* Mode indicator (read-only) */}
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    isRoot
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  Kategori Baru
                </span>
                <span
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    !isRoot
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  Sub-Kategori
                </span>
              </div>

              {/* Parent hierarchy for sub-categories (read-only) */}
              {!isRoot && (
                <div className="space-y-2">
                  <Label>Kategori Induk</Label>

                  <div className="grid grid-cols-1 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                    {(["Level 1", "Level 2", "Level 3"] as const).map((label, idx) => (
                      <div key={label} className="flex min-h-[180px] flex-col">
                        <div className="px-3 pb-1.5 pt-2.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {label}
                          </span>
                        </div>
                        <ScrollArea className="flex-1">
                          {columns[idx].length > 0 ? (
                            <ul className="flex flex-col gap-0.5 p-1.5 pt-0">
                              {columns[idx].map((n) => (
                                <li key={n.id}>
                                  <div
                                    className={cn(
                                      "flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm",
                                      trailIds.has(n.id)
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
                          ) : (
                            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                              —
                            </p>
                          )}
                        </ScrollArea>
                      </div>
                    ))}
                  </div>

                  {parentLabel && (
                    <p className="text-sm text-muted-foreground">
                      Induk:{" "}
                      <span className="font-medium text-foreground">
                        {parentLabel}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Name input */}
              <div className="space-y-2">
                <Label htmlFor="edit-kategori-name">Nama Kategori</Label>
                <Input
                  id="edit-kategori-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama kategori"
                  autoFocus
                />
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
