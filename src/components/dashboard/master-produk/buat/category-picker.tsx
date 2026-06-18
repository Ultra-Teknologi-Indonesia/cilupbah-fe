"use client"

import * as React from "react"
import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { findCategoryPath } from "@/lib/master-produk/category-tree"
import type { CategoryNode, SelectedCategory } from "@/types/master-produk"

function Column({
  nodes,
  activeId,
  onSelect,
}: {
  nodes: CategoryNode[]
  activeId?: string
  onSelect: (n: CategoryNode) => void
}) {
  if (nodes.length === 0) return <div className="hidden lg:block" aria-hidden />
  return (
    <ScrollArea className="h-64">
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

export function CategoryPicker({
  value,
  onChange,
  invalid,
  tree = [],
  triggerClassName,
}: {
  value: SelectedCategory | null
  onChange: (v: SelectedCategory) => void
  invalid?: boolean
  tree?: CategoryNode[]
  triggerClassName?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [path, setPath] = React.useState<CategoryNode[]>([])

  const handleOpen = (next: boolean) => {
    setOpen(next)
    if (next) {
      setPath(value ? findCategoryPath(tree, value.id) ?? [] : [])
    }
  }

  const columns = [tree, path[0]?.children ?? [], path[1]?.children ?? []]
  const chosen = path[path.length - 1] ?? null
  const isLeaf = chosen ? !chosen.children?.length : false

  const selectAt = (level: number, node: CategoryNode) =>
    setPath((prev) => [...prev.slice(0, level), node])

  const apply = () => {
    if (!chosen) return
    onChange({ id: chosen.id, name: chosen.name, path: path.map((p) => p.name) })
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpen(true)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 text-sm outline-none transition-[color,box-shadow]",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
          invalid && "border-destructive ring-3 ring-destructive/20",
          triggerClassName
        )}
      >
        {value ? (
          <span className="truncate">
            <span className="text-muted-foreground">
              {value.path.slice(0, -1).join(" › ")}
              {value.path.length > 1 ? " › " : ""}
            </span>
            <span className="font-medium">{value.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Pilih kategori</span>
        )}
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent
          showCloseButton={false}
          className="border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-3xl"
        >
          <LiquidGlass radius={28} intensity="strong" className="bg-white/85 dark:bg-neutral-900/85">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
              <div>
                <DialogTitle className="text-lg">Pilih Kategori</DialogTitle>
                <DialogDescription className="sr-only">
                  Telusuri kategori berjenjang: kategori, subkategori, jenis.
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Tutup">
                  <ChevronRightIcon className="size-4 rotate-90" />
                </Button>
              </DialogClose>
            </div>

            <div className="px-5 py-4 sm:px-6">
              <div className="grid grid-cols-1 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                <Column nodes={columns[0]} activeId={path[0]?.id} onSelect={(n) => selectAt(0, n)} />
                <Column nodes={columns[1]} activeId={path[1]?.id} onSelect={(n) => selectAt(1, n)} />
                <Column nodes={columns[2]} activeId={path[2]?.id} onSelect={(n) => selectAt(2, n)} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-4 sm:px-6">
              <span className="text-sm text-muted-foreground">
                {!chosen
                  ? "Belum dipilih"
                  : isLeaf
                    ? path.map((p) => p.name).join(" › ")
                    : `${path.map((p) => p.name).join(" › ")} — pilih sampai level terdalam`}
              </span>
              <Button onClick={apply} disabled={!chosen || !isLeaf}>
                {isLeaf ? "Pilih kategori ini" : "Pilih subkategori"}
              </Button>
            </div>
          </LiquidGlass>
        </DialogContent>
      </Dialog>
    </>
  )
}
