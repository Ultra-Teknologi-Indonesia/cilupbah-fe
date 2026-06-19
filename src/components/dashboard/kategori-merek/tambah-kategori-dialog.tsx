"use client"

import * as React from "react"
import { ChevronRightIcon, Loader2Icon, SearchIcon, XIcon } from "lucide-react"

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
import { useEnabledCategories, useCreateKategori } from "@/hooks/kategori-merek/use-kategori"
import type { KategoriItem } from "@/types/kategori-merek/kategori"

type Mode = "root" | "sub"

function Column({
  nodes,
  activeId,
  onSelect,
}: {
  nodes: KategoriItem[]
  activeId?: number
  onSelect: (n: KategoriItem) => void
}) {
  if (nodes.length === 0) return <div className="hidden lg:block" aria-hidden />
  return (
    <ScrollArea className="h-56">
      <ul className="flex flex-col gap-0.5 p-1.5">
        {nodes.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onSelect(n)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                n.id === activeId
                  ? "bg-primary/10 font-medium text-primary"
                  : "hover:bg-muted/60"
              )}
            >
              <span className="truncate">{n.name}</span>
              {n.children?.length ? (
                <ChevronRightIcon className="size-4 shrink-0 opacity-50" />
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}

interface TambahKategoriDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TambahKategoriDialog({ open, onOpenChange }: TambahKategoriDialogProps) {
  const [mode, setMode] = React.useState<Mode>("root")
  const [name, setName] = React.useState("")
  const [path, setPath] = React.useState<KategoriItem[]>([])
  const [search, setSearch] = React.useState("")

  const { data: tree } = useEnabledCategories()
  const createMut = useCreateKategori()

  const columns: KategoriItem[][] = [
    tree ?? [],
    path[0]?.children ?? [],
    path[1]?.children ?? [],
  ]

  const selectAt = (level: number, node: KategoriItem) =>
    setPath((prev) => [...prev.slice(0, level), node])

  const parentId = mode === "sub" ? path[path.length - 1]?.id ?? null : null
  const parentLabel = path.map((p) => p.name).join(" > ")

  const flat = React.useMemo(() => {
    if (!tree) return []
    const result: { node: KategoriItem; path: KategoriItem[]; label: string }[] = []
    const walk = (nodes: KategoriItem[], parents: KategoriItem[]) => {
      for (const n of nodes) {
        const p = [...parents, n]
        result.push({ node: n, path: p, label: p.map((x) => x.name).join(" > ") })
        if (n.children?.length) walk(n.children, p)
      }
    }
    walk(tree, [])
    return result
  }, [tree])

  const searchResults = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return null
    return flat.filter((f) => f.label.toLowerCase().includes(q)).slice(0, 50)
  }, [search, flat])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (mode === "sub" && !parentId) return

    createMut.mutate(
      {
        name: trimmed,
        parent_id: parentId,
        is_active: true,
        is_leaf: true,
      },
      {
        onSuccess: () => {
          setName("")
          setPath([])
          onOpenChange(false)
        },
      }
    )
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName("")
      setPath([])
      setSearch("")
      setMode("root")
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={createMut.isPending ? undefined : handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-2xl"
      >
        <LiquidGlass radius={28} intensity="strong" className="bg-white/85 dark:bg-neutral-900/85">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
            <div>
              <DialogTitle className="text-lg">Tambah Kategori</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Buat kategori baru atau sub-kategori.
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
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setMode("root"); setPath([]); setSearch("") }}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    mode === "root"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted/60"
                  )}
                >
                  Kategori Baru
                </button>
                <button
                  type="button"
                  onClick={() => setMode("sub")}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    mode === "sub"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted/60"
                  )}
                >
                  Sub-Kategori
                </button>
              </div>

              {mode === "sub" && (
                <div className="space-y-2">
                  <Label>Kategori Induk</Label>

                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari kategori induk..."
                      className="pl-9"
                    />
                  </div>

                  {searchResults ? (
                    <ScrollArea className="h-56 rounded-2xl border border-border/60">
                      {searchResults.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                          Tidak ditemukan.
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-0.5 p-1.5">
                          {searchResults.map((item) => (
                            <li key={item.node.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setPath(item.path)
                                  setSearch("")
                                }}
                                className={cn(
                                  "flex w-full flex-col gap-0.5 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60",
                                  item.node.id === path[path.length - 1]?.id && "bg-primary/10"
                                )}
                              >
                                <span className="truncate font-medium">{item.node.name}</span>
                                <span className="truncate text-xs text-muted-foreground">
                                  {item.label}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </ScrollArea>
                  ) : (
                    <div className="grid grid-cols-1 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                      <Column nodes={columns[0]} activeId={path[0]?.id} onSelect={(n) => selectAt(0, n)} />
                      <Column nodes={columns[1]} activeId={path[1]?.id} onSelect={(n) => selectAt(1, n)} />
                      <Column nodes={columns[2]} activeId={path[2]?.id} onSelect={(n) => selectAt(2, n)} />
                    </div>
                  )}

                  {parentId && (
                    <p className="text-sm text-muted-foreground">
                      Induk: <span className="font-medium text-foreground">{parentLabel}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="kategori-name">Nama Kategori</Label>
                <Input
                  id="kategori-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={mode === "root" ? "Nama kategori baru" : "Nama sub-kategori"}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/60 px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={createMut.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  !name.trim() ||
                  (mode === "sub" && !parentId) ||
                  createMut.isPending
                }
              >
                {createMut.isPending && <Loader2Icon className="animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </LiquidGlass>
      </DialogContent>
    </Dialog>
  )
}
