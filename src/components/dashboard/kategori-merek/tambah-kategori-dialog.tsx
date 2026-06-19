"use client"

import * as React from "react"
import {
  CheckIcon,
  ChevronRightIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
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
  useCreateKategori,
  useSearchKategori,
  useUpdateKategori,
} from "@/hooks/kategori-merek/use-kategori"
import type { KategoriItem } from "@/types/kategori-merek/kategori"

type Mode = "root" | "sub"

function findNode(nodes: KategoriItem[], id: number): KategoriItem | undefined {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children?.length) {
      const found = findNode(n.children, id)
      if (found) return found
    }
  }
}

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
          placeholder="Tambah cepat..."
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

function ColumnItem({
  node,
  isActive,
  onSelect,
}: {
  node: KategoriItem
  isActive: boolean
  onSelect: () => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(node.name)
  const editRef = React.useRef<HTMLInputElement>(null)
  const updateMut = useUpdateKategori()

  React.useEffect(() => {
    if (editing) {
      setEditValue(node.name)
      requestAnimationFrame(() => editRef.current?.select())
    }
  }, [editing, node.name])

  const saveEdit = () => {
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === node.name) {
      setEditing(false)
      return
    }
    updateMut.mutate(
      { id: node.id, name: trimmed },
      { onSuccess: () => setEditing(false) },
    )
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 rounded-xl bg-muted/40 px-2 py-1">
        <input
          ref={editRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveEdit()
            if (e.key === "Escape") setEditing(false)
          }}
          disabled={updateMut.isPending}
          className="h-6 min-w-0 flex-1 rounded border border-primary/40 bg-background px-1.5 text-xs outline-none focus:border-primary"
        />
        {updateMut.isPending ? (
          <Loader2Icon className="size-3 animate-spin text-primary" />
        ) : (
          <>
            <button type="button" onClick={saveEdit} className="p-0.5 text-primary">
              <CheckIcon className="size-3" />
            </button>
            <button type="button" onClick={() => setEditing(false)} className="p-0.5 text-muted-foreground">
              <XIcon className="size-3" />
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="group flex items-center">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
          isActive
            ? "bg-primary/10 font-medium text-primary"
            : "hover:bg-muted/60",
        )}
      >
        <span className="truncate">{node.name}</span>
        {node.children?.length ? (
          <ChevronRightIcon className="size-4 shrink-0 opacity-50" />
        ) : null}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setEditing(true)
        }}
        className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        aria-label={`Edit ${node.name}`}
      >
        <PencilIcon className="size-3" />
      </button>
    </div>
  )
}

function Column({
  label,
  nodes,
  activeId,
  parentId,
  onSelect,
  showAdd,
}: {
  label: string
  nodes: KategoriItem[]
  activeId?: number
  parentId: number | null
  onSelect: (n: KategoriItem) => void
  showAdd: boolean
}) {
  return (
    <div className="flex min-h-[220px] flex-col">
      <div className="px-3 pb-1.5 pt-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>

      {showAdd && <InlineAdd parentId={parentId} />}

      <ScrollArea className="flex-1">
        {nodes.length === 0 && !showAdd ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            Pilih kategori di kolom sebelumnya
          </p>
        ) : nodes.length === 0 && showAdd ? (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">
            Belum ada. Tambah di atas.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5 p-1.5 pt-0">
            {nodes.map((n) => (
              <li key={n.id}>
                <ColumnItem
                  node={n}
                  isActive={n.id === activeId}
                  onSelect={() => onSelect(n)}
                />
              </li>
            ))}
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
  const [mode, setMode] = React.useState<Mode>("root")
  const [name, setName] = React.useState("")
  const [pathIds, setPathIds] = React.useState<number[]>([])
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  const { data: tree } = useEnabledCategories()
  const { data: searchResults, isFetching: isSearching } = useSearchKategori(debouncedSearch)
  const createMut = useCreateKategori()

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

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

  const selectAt = (level: number, node: KategoriItem) =>
    setPathIds((prev) => [...prev.slice(0, level), node.id])

  const parentId = mode === "sub" ? pathIds[pathIds.length - 1] ?? null : null
  const parentLabel = resolved.map((p) => p.name).join(" > ")

  const searchHits = React.useMemo(() => {
    if (!searchResults || !tree) return null
    return searchResults.map((item) => {
      const trail = buildPath(tree, item.id)
      return {
        node: item,
        trail,
        label: trail.map((t) => t.name).join(" > "),
      }
    })
  }, [searchResults, tree])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (mode === "sub" && !parentId) return

    createMut.mutate(
      { name: trimmed, parent_id: parentId, is_active: true },
      {
        onSuccess: () => {
          setName("")
          setPathIds([])
          onOpenChange(false)
        },
      },
    )
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName("")
      setPathIds([])
      setSearch("")
      setDebouncedSearch("")
      setMode("root")
    }
    onOpenChange(next)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={createMut.isPending ? undefined : handleOpenChange}
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
              {/* Mode toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode("root")
                    setPathIds([])
                    setSearch("")
                    setDebouncedSearch("")
                  }}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    mode === "root"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted/60",
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
                      : "border-border hover:bg-muted/60",
                  )}
                >
                  Sub-Kategori
                </button>
              </div>

              {/* Sub-kategori picker */}
              {mode === "sub" && (
                <div className="space-y-2">
                  <Label>Kategori Induk</Label>

                  {/* Search (API-based) */}
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari kategori..."
                      className="pl-9"
                    />
                    {isSearching && (
                      <Loader2Icon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {/* Search results (API) */}
                  {debouncedSearch.length >= 2 ? (
                    <ScrollArea className="h-56 rounded-2xl border border-border/60">
                      {isSearching ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                          <Loader2Icon className="size-4 animate-spin" /> Mencari...
                        </div>
                      ) : !searchHits || searchHits.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                          Tidak ditemukan.
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-0.5 p-1.5">
                          {searchHits.map((item) => (
                            <li key={item.node.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  const ids = item.trail.map((t) => t.id)
                                  setPathIds(ids.slice(0, 3))
                                  setSearch("")
                                  setDebouncedSearch("")
                                }}
                                className={cn(
                                  "flex w-full flex-col gap-0.5 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60",
                                  pathIds.includes(item.node.id) &&
                                    "bg-primary/10",
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
                        showAdd
                      />
                      <Column
                        label="Level 2"
                        nodes={columns[1]}
                        activeId={pathIds[1]}
                        parentId={resolved[0]?.id ?? null}
                        onSelect={(n) => selectAt(1, n)}
                        showAdd={Boolean(resolved[0])}
                      />
                      <Column
                        label="Level 3"
                        nodes={columns[2]}
                        activeId={pathIds[2]}
                        parentId={resolved[1]?.id ?? null}
                        onSelect={(n) => selectAt(2, n)}
                        showAdd={Boolean(resolved[1])}
                      />
                    </div>
                  )}

                  {/* Selected parent breadcrumb */}
                  {parentId && (
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
                <Label htmlFor="kategori-name">Nama Kategori</Label>
                <Input
                  id="kategori-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    mode === "root"
                      ? "Nama kategori baru"
                      : "Nama sub-kategori"
                  }
                  autoFocus
                />
              </div>
            </div>

            {/* Footer with Simpan */}
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
