"use client"

import * as React from "react"
import { ChevronRightIcon, Loader2Icon, RefreshCwIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useChannelCategories,
  useMapCategoryToChannel,
} from "@/hooks/kategori-merek/use-kategori"
import type { ChannelCategoryNode } from "@/types/kategori-merek/kategori"
import { useQueryClient } from "@tanstack/react-query"

interface FlatChannelCategory {
  node: ChannelCategoryNode
  path: ChannelCategoryNode[]
  pathLabel: string
}

function buildTree(categories: ChannelCategoryNode[]): ChannelCategoryNode[] {
  const byParent = new Map<string, ChannelCategoryNode[]>()

  for (const cat of categories) {
    const key = cat.parent_external_id ?? "0"
    const list = byParent.get(key) ?? []
    list.push({ ...cat, children: [] })
    byParent.set(key, list)
  }

  function attachChildren(nodes: ChannelCategoryNode[]): ChannelCategoryNode[] {
    return nodes
      .map((node) => ({
        ...node,
        children: attachChildren(byParent.get(node.external_id) ?? []),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const roots = byParent.get("0") ?? []
  return attachChildren(roots)
}

function flattenTree(
  nodes: ChannelCategoryNode[],
  parents: ChannelCategoryNode[] = []
): FlatChannelCategory[] {
  const result: FlatChannelCategory[] = []
  for (const node of nodes) {
    const path = [...parents, node]
    result.push({ node, path, pathLabel: path.map((p) => p.name).join(" > ") })
    if (node.children?.length) {
      result.push(...flattenTree(node.children, path))
    }
  }
  return result
}

function Column({
  nodes,
  activeId,
  onSelect,
}: {
  nodes: ChannelCategoryNode[]
  activeId?: string
  onSelect: (n: ChannelCategoryNode) => void
}) {
  if (nodes.length === 0) return <div className="hidden lg:block" aria-hidden />
  return (
    <ScrollArea className="h-72">
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
              {(n.children?.length ?? 0) > 0 ? (
                <ChevronRightIcon className="size-4 shrink-0 opacity-50" />
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}

interface PetakanKategoriDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channelId: string
  channelName: string
  categoryId: number
  categoryName: string
  onSuccess?: () => void
}

export function PetakanKategoriDialog({
  open,
  onOpenChange,
  channelId,
  channelName,
  categoryId,
  categoryName,
  onSuccess,
}: PetakanKategoriDialogProps) {
  const [path, setPath] = React.useState<ChannelCategoryNode[]>([])
  const [search, setSearch] = React.useState("")

  const qc = useQueryClient()
  const { data: rawCategories, isLoading, isError } = useChannelCategories(
    open ? channelId : ""
  )
  const mapMutation = useMapCategoryToChannel()

  const tree = React.useMemo(() => buildTree(rawCategories ?? []), [rawCategories])

  const flat = React.useMemo(() => flattenTree(tree), [tree])

  const searchResults = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return null
    return flat.filter((f) => f.node.name.toLowerCase().includes(q)).slice(0, 50)
  }, [search, flat])

  React.useEffect(() => {
    if (open) {
      setPath([])
      setSearch("")
    }
  }, [open])

  const columns = [tree, path[0]?.children ?? [], path[1]?.children ?? []]
  const chosen = path[path.length - 1] ?? null
  const isLeaf = chosen?.is_leaf ?? false

  const selectAt = (level: number, node: ChannelCategoryNode) =>
    setPath((prev) => [...prev.slice(0, level), node])

  const selectFromSearch = (item: FlatChannelCategory) => {
    setPath(item.path)
    setSearch("")
  }

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ["kategori", "channel-categories", channelId] })
  }

  const handleSimpan = () => {
    if (!chosen || !isLeaf) return
    mapMutation.mutate(
      { categoryId, channelCategoryIds: [chosen.id] },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl gap-0 p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg">Petakan Kategori</DialogTitle>
          <DialogDescription className="sr-only">
            Pilih kategori {channelName} untuk &ldquo;{categoryName}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kategori"
              className="pl-9"
            />
          </div>
        </div>

        <div className="px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" /> Memuat kategori {channelName}…
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-sm text-destructive">
              Gagal memuat kategori. Pastikan kategori {channelName} sudah di-sync.
            </div>
          ) : (rawCategories?.length ?? 0) === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Belum ada kategori {channelName}. Silakan sync kategori terlebih dahulu.
            </div>
          ) : searchResults ? (
            <ScrollArea className="h-72 rounded-2xl border border-border/60">
              {searchResults.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Tidak ditemukan kategori untuk &ldquo;{search}&rdquo;
                </p>
              ) : (
                <ul className="flex flex-col gap-0.5 p-1.5">
                  {searchResults.map((item) => (
                    <li key={item.node.id}>
                      <button
                        type="button"
                        onClick={() => selectFromSearch(item)}
                        className={cn(
                          "flex w-full flex-col gap-0.5 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60",
                          item.node.id === chosen?.id && "bg-primary/10"
                        )}
                      >
                        <span className={cn("truncate", item.node.is_leaf ? "font-medium" : "")}>
                          {item.node.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {item.pathLabel}
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
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-6 py-4">
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {!chosen
              ? "Nama Kategori  - /"
              : isLeaf
                ? path.map((p) => p.name).join(" > ")
                : `${path.map((p) => p.name).join(" > ")} — pilih sampai level terdalam`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCwIcon className="size-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSimpan}
              disabled={!chosen || !isLeaf || mapMutation.isPending}
            >
              {mapMutation.isPending ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : null}
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
