"use client"

import * as React from "react"
import {
  CheckIcon,
  ChevronRightIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

function findNode(nodes: KategoriItem[], id: number): KategoriItem | undefined {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children?.length) {
      const found = findNode(n.children, id)
      if (found) return found
    }
  }
}

function InlineAdd({
  parentId,
  disabled,
}: {
  parentId: number | null
  disabled?: boolean
}) {
  const [value, setValue] = React.useState("")
  const [focused, setFocused] = React.useState(false)
  const createMut = useCreateKategori()

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || createMut.isPending) return
    createMut.mutate(
      { name: trimmed, parent_id: parentId, is_active: true },
      { onSuccess: () => setValue("") },
    )
  }

  return (
    <div className="px-1.5 pb-1.5">
      <div
        className={cn(
          "flex items-center gap-1 rounded-xl border border-dashed px-2 transition-colors",
          focused
            ? "border-primary bg-primary/5"
            : "border-border/60 hover:border-primary/40",
          disabled && "pointer-events-none opacity-40",
        )}
      >
        {createMut.isPending ? (
          <Loader2Icon className="size-3.5 shrink-0 animate-spin text-primary" />
        ) : (
          <PlusIcon className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="Ketik nama..."
          disabled={disabled || createMut.isPending}
          className="h-8 w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
        />
        {value.trim() && (
          <button
            type="button"
            onClick={submit}
            disabled={createMut.isPending}
            className="shrink-0 rounded-md p-0.5 text-primary hover:bg-primary/10"
          >
            <CheckIcon className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

function Column({
  label,
  nodes,
  activeId,
  parentId,
  onSelect,
  justAddedId,
  showAdd,
}: {
  label: string
  nodes: KategoriItem[]
  activeId?: number
  parentId: number | null
  onSelect: (n: KategoriItem) => void
  justAddedId: number | null
  showAdd: boolean
}) {
  return (
    <div className="flex min-h-[260px] flex-col">
      <div className="px-3 pb-1.5 pt-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>

      {showAdd && <InlineAdd parentId={parentId} />}

      <ScrollArea className="flex-1">
        {nodes.length === 0 && !showAdd ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            {parentId === null ? "Belum ada kategori" : "Pilih kategori di kolom sebelumnya"}
          </p>
        ) : nodes.length === 0 && showAdd ? (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">
            Belum ada. Tambah di atas.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5 p-1.5 pt-0">
            {nodes.map((n) => {
              const isActive = n.id === activeId
              const isJustAdded = n.id === justAddedId
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(n)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 font-medium text-primary"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {isJustAdded && (
                        <span className="inline-flex size-1.5 shrink-0 rounded-full bg-emerald-500" />
                      )}
                      <span className="truncate">{n.name}</span>
                    </span>
                    {n.children?.length ? (
                      <ChevronRightIcon className="size-4 shrink-0 opacity-50" />
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  )
}

interface TambahKategoriDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TambahKategoriDialog({
  open,
  onOpenChange,
}: TambahKategoriDialogProps) {
  const [pathIds, setPathIds] = React.useState<number[]>([])
  const [search, setSearch] = React.useState("")
  const [justAddedId, setJustAddedId] = React.useState<number | null>(null)

  const { data: tree } = useEnabledCategories()

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

  const selectAt = (level: number, node: KategoriItem) => {
    setPathIds((prev) => [...prev.slice(0, level), node.id])
    setJustAddedId(null)
  }

  const flat = React.useMemo(() => {
    if (!tree) return []
    const result: { node: KategoriItem; ancestors: KategoriItem[]; label: string }[] = []
    const walk = (nodes: KategoriItem[], parents: KategoriItem[]) => {
      for (const n of nodes) {
        const p = [...parents, n]
        result.push({
          node: n,
          ancestors: parents,
          label: p.map((x) => x.name).join(" > "),
        })
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

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPathIds([])
      setSearch("")
      setJustAddedId(null)
    }
    onOpenChange(next)
  }

  const breadcrumb = resolved.map((n) => n.name)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
              <DialogTitle className="text-lg">Kelola Sub-Kategori</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Tambah kategori di level manapun (maks. 3 level).
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Tutup">
                <XIcon className="size-4" />
              </Button>
            </DialogClose>
          </div>

          <div className="space-y-3 px-5 py-4 sm:px-6">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kategori..."
                className="pl-9"
              />
            </div>

            {/* Search results */}
            {searchResults ? (
              <ScrollArea className="h-64 rounded-2xl border border-border/60">
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
                            const ids = [
                              ...item.ancestors.map((a) => a.id),
                              item.node.id,
                            ]
                            setPathIds(ids.slice(0, 3))
                            setSearch("")
                          }}
                          className={cn(
                            "flex w-full flex-col gap-0.5 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60",
                            pathIds.includes(item.node.id) && "bg-primary/10",
                          )}
                        >
                          <span className="truncate font-medium">
                            {item.node.name}
                          </span>
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
              /* 3-column picker */
              <div className="grid grid-cols-1 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                <Column
                  label="Level 1"
                  nodes={columns[0]}
                  activeId={pathIds[0]}
                  parentId={null}
                  onSelect={(n) => selectAt(0, n)}
                  justAddedId={justAddedId}
                  showAdd
                />
                <Column
                  label="Level 2"
                  nodes={columns[1]}
                  activeId={pathIds[1]}
                  parentId={resolved[0]?.id ?? null}
                  onSelect={(n) => selectAt(1, n)}
                  justAddedId={justAddedId}
                  showAdd={Boolean(resolved[0])}
                />
                <Column
                  label="Level 3"
                  nodes={columns[2]}
                  activeId={pathIds[2]}
                  parentId={resolved[1]?.id ?? null}
                  onSelect={(n) => selectAt(2, n)}
                  justAddedId={justAddedId}
                  showAdd={Boolean(resolved[1])}
                />
              </div>
            )}

            {/* Breadcrumb */}
            {breadcrumb.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="shrink-0 text-xs">Path:</span>
                {breadcrumb.map((name, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <ChevronRightIcon className="size-3 shrink-0 opacity-40" />
                    )}
                    <span
                      className={cn(
                        "truncate font-medium",
                        i === breadcrumb.length - 1
                          ? "text-primary"
                          : "text-foreground",
                      )}
                    >
                      {name}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-border/60 px-5 py-3 sm:px-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
              Tutup
            </Button>
          </div>
        </LiquidGlass>
      </DialogContent>
    </Dialog>
  )
}
