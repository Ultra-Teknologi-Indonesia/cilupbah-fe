"use client"

import * as React from "react"
import {
  CheckIcon,
  DownloadIcon,
  Loader2Icon,
  SearchIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  useSystemCategories,
  useEnabledCategories,
  useEnableKategori,
} from "@/hooks/kategori-merek/use-kategori"
import type { KategoriItem } from "@/types/kategori-merek/kategori"

interface FlatLeaf {
  id: number
  name: string
  fullPath: string
}

function collectLeaves(
  nodes: KategoriItem[],
  parents: string[] = []
): FlatLeaf[] {
  const result: FlatLeaf[] = []
  for (const node of nodes) {
    const path = [...parents, node.name]
    if (node.is_leaf || !node.children?.length) {
      result.push({ id: node.id, name: node.name, fullPath: path.join(" > ") })
    }
    if (node.children?.length) {
      result.push(...collectLeaves(node.children, path))
    }
  }
  return result
}

function collectEnabledIds(nodes: KategoriItem[]): Set<number> {
  const ids = new Set<number>()
  for (const node of nodes) {
    ids.add(node.id)
    if (node.children?.length) {
      for (const id of collectEnabledIds(node.children)) ids.add(id)
    }
  }
  return ids
}

interface ImportSystemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportSystemDialog({ open, onOpenChange }: ImportSystemDialogProps) {
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<Set<number>>(new Set())

  const { data: systemTree, isLoading } = useSystemCategories(open)
  const { data: enabledTree } = useEnabledCategories()
  const enableMut = useEnableKategori()

  const enabledIds = React.useMemo(
    () => collectEnabledIds(enabledTree ?? []),
    [enabledTree]
  )

  const leaves = React.useMemo(
    () => collectLeaves(systemTree ?? []),
    [systemTree]
  )

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return leaves
    return leaves.filter((l) => l.fullPath.toLowerCase().includes(q))
  }, [leaves, search])

  const importable = filtered.filter((l) => !enabledIds.has(l.id))

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    const ids = importable.map((l) => l.id)
    const allSelected = ids.every((id) => selected.has(id))
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.add(id))
        return next
      })
    }
  }

  const handleImport = () => {
    if (selected.size === 0) return
    enableMut.mutate([...selected], {
      onSuccess: () => {
        setSelected(new Set())
        onOpenChange(false)
      },
    })
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSearch("")
      setSelected(new Set())
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={enableMut.isPending ? undefined : handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-2xl"
      >
        <LiquidGlass radius={28} intensity="strong" className="bg-white/85 dark:bg-neutral-900/85">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
            <div>
              <DialogTitle className="text-lg">Import dari Sistem</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Pilih kategori sistem yang ingin diaktifkan.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Tutup">
                <XIcon className="size-4" />
              </Button>
            </DialogClose>
          </div>

          <div className="px-5 pt-4 sm:px-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kategori sistem..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="px-5 py-3 sm:px-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filtered.length} kategori
                {selected.size > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selected.size} dipilih
                  </Badge>
                )}
              </span>
              {importable.length > 0 && (
                <Button variant="ghost" size="sm" onClick={toggleAll}>
                  {importable.every((l) => selected.has(l.id))
                    ? "Batal pilih semua"
                    : "Pilih semua"}
                </Button>
              )}
            </div>
          </div>

          <div className="px-5 sm:px-6">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" /> Memuat kategori sistem…
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                {search ? "Tidak ditemukan kategori." : "Tidak ada kategori sistem."}
              </div>
            ) : (
              <ScrollArea className="h-80 rounded-2xl border border-border/60">
                <ul className="flex flex-col gap-0.5 p-1.5">
                  {filtered.map((leaf) => {
                    const alreadyEnabled = enabledIds.has(leaf.id)
                    const isChecked = selected.has(leaf.id)
                    return (
                      <li key={leaf.id}>
                        <button
                          type="button"
                          disabled={alreadyEnabled}
                          onClick={() => toggleOne(leaf.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                            alreadyEnabled
                              ? "opacity-50 cursor-not-allowed"
                              : isChecked
                                ? "bg-primary/10"
                                : "hover:bg-muted/60"
                          )}
                        >
                          {alreadyEnabled ? (
                            <div className="flex size-4 items-center justify-center rounded border border-primary bg-primary text-primary-foreground">
                              <CheckIcon className="size-3" />
                            </div>
                          ) : (
                            <Checkbox
                              checked={isChecked}
                              tabIndex={-1}
                              className="pointer-events-none"
                            />
                          )}
                          <span className="flex-1 truncate">{leaf.fullPath}</span>
                          {alreadyEnabled && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              Sudah diimpor
                            </Badge>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </ScrollArea>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border/60 px-5 py-4 sm:px-6">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={enableMut.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={selected.size === 0 || enableMut.isPending}
            >
              {enableMut.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <DownloadIcon />
              )}
              Import {selected.size > 0 ? `(${selected.size})` : ""}
            </Button>
          </div>
        </LiquidGlass>
      </DialogContent>
    </Dialog>
  )
}
