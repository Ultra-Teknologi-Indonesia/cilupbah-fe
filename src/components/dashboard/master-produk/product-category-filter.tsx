"use client"

import * as React from "react"
import type { Column } from "@tanstack/react-table"
import {
  ChevronRightIcon,
  PlusCircleIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { CATEGORY_TREE } from "@/mocks/master-produk/mock-categories"
import {
  collectLeafNames,
  findCategoryPath,
} from "@/lib/master-produk/category-tree"
import type { CategoryNode } from "@/types/master-produk"

function CategoryColumn({
  nodes,
  activeId,
  onSelect,
}: {
  nodes: CategoryNode[]
  activeId?: string
  onSelect: (node: CategoryNode) => void
}) {
  if (nodes.length === 0) {
    return <div className="hidden lg:block" aria-hidden />
  }
  return (
    <ScrollArea className="h-72 lg:h-80">
      <ul className="flex flex-col gap-0.5 p-1.5">
        {nodes.map((node) => {
          const active = node.id === activeId
          return (
            <li key={node.id}>
              <button
                type="button"
                onClick={() => onSelect(node)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-brand/10 font-medium text-brand"
                    : "hover:bg-muted/60"
                )}
              >
                <span className="truncate">{node.name}</span>
                {node.children?.length ? (
                  <ChevronRightIcon className="size-4 shrink-0 opacity-50" />
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </ScrollArea>
  )
}

export function ProductCategoryFilter({
  column,
  tree = CATEGORY_TREE,
  title = "Kategori",
}: {
  column?: Column<unknown, unknown>
  tree?: CategoryNode[]
  title?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [path, setPath] = React.useState<CategoryNode[]>([])
  const [applied, setApplied] = React.useState<CategoryNode | null>(null)

  const filterValue = (column?.getFilterValue() as string[] | undefined) ?? []
  const hasFilter = filterValue.length > 0

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      setQuery("")
      setPath(applied ? findCategoryPath(tree, applied.id) ?? [] : [])
    }
  }

  const columns = [
    tree,
    path[0]?.children ?? [],
    path[1]?.children ?? [],
  ]
  const chosen = path[path.length - 1] ?? null

  const selectAt = (level: number, node: CategoryNode) =>
    setPath((prev) => [...prev.slice(0, level), node])

  const apply = () => {
    if (!chosen) return
    const leaves = collectLeafNames(chosen)
    column?.setFilterValue(leaves.length ? leaves : undefined)
    setApplied(chosen)
    setOpen(false)
  }

  const clear = () => {
    column?.setFilterValue(undefined)
    setApplied(null)
    setPath([])
    setOpen(false)
  }

  const searchResults = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    const out: { node: CategoryNode; trail: CategoryNode[] }[] = []
    const walk = (nodes: CategoryNode[], trail: CategoryNode[]) => {
      for (const node of nodes) {
        const next = [...trail, node]
        const isLeaf = !node.children?.length
        if (isLeaf && node.name.toLowerCase().includes(q)) {
          out.push({ node, trail: next })
        }
        if (node.children) walk(node.children, next)
      }
    }
    walk(tree, [])
    return out
  }, [query, tree])

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2 rounded-full"
        onClick={() => handleOpenChange(true)}
      >
        <PlusCircleIcon className="size-4" />
        {title}
        {applied && hasFilter && (
          <>
            <Separator orientation="vertical" className="mx-0.5 h-4" />
            <Badge
              variant="secondary"
              className="max-w-[10rem] truncate rounded-sm px-1 font-normal"
            >
              {applied.name}
            </Badge>
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-3xl"
        >
          <LiquidGlass
            radius={28}
            intensity="strong"
            className="bg-white/85 dark:bg-neutral-900/85"
          >

            <div className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4 sm:px-6">
              <div>
                <DialogTitle className="text-lg">Pilih Kategori</DialogTitle>
                <DialogDescription className="sr-only">
                  Telusuri kategori berjenjang: kategori, subkategori, lalu jenis.
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
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari kategori"
                  className="h-10 rounded-full border-border bg-background pl-9"
                />
              </div>
            </div>

            <div className="px-5 py-4 sm:px-6">
              {searchResults ? (
                <ScrollArea className="h-72 rounded-2xl border border-border/60 lg:h-80">
                  <ul className="flex flex-col gap-0.5 p-1.5">
                    {searchResults.length === 0 && (
                      <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                        Tidak ada kategori yang cocok.
                      </li>
                    )}
                    {searchResults.map(({ node, trail }) => (
                      <li key={node.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setPath(trail)
                            setQuery("")
                          }}
                          className="flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted/60"
                        >
                          <span className="text-sm font-medium">
                            {node.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {trail.map((t) => t.name).join(" › ")}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : (
                <div className="grid grid-cols-1 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                  <CategoryColumn
                    nodes={columns[0]}
                    activeId={path[0]?.id}
                    onSelect={(n) => selectAt(0, n)}
                  />
                  <CategoryColumn
                    nodes={columns[1]}
                    activeId={path[1]?.id}
                    onSelect={(n) => selectAt(1, n)}
                  />
                  <CategoryColumn
                    nodes={columns[2]}
                    activeId={path[2]?.id}
                    onSelect={(n) => selectAt(2, n)}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-4 sm:px-6">
              <Button
                variant="ghost"
                onClick={clear}
                disabled={!applied && !hasFilter}
              >
                Hapus filter
              </Button>
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {chosen ? chosen.name : "Belum dipilih"}
                </span>
                <Button onClick={apply} disabled={!chosen}>
                  Simpan
                </Button>
              </div>
            </div>
          </LiquidGlass>
        </DialogContent>
      </Dialog>
    </>
  )
}
