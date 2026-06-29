"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ImageIcon, Loader2Icon, SearchIcon, SearchXIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMasterProducts } from "@/hooks/master-produk/use-master-products"
import type { Product } from "@/types/master-produk"

export function ProductPickerDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSearchInput("")
      setSearch("")
    }
    onOpenChange(next)
  }

  const { data, isLoading } = useMasterProducts({
    search: search || undefined,
    perPage: 20,
  })
  const items = data?.items ?? []

  const onPick = (product: Product) => {
    router.push(`/dashboard/produk/${product.itemGroupId}/upload-to-channel`)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Pilih produk</DialogTitle>
          <DialogDescription>
            Pilih produk master untuk diupload ke channel.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama / SKU…"
            className="h-9 rounded-full border-border bg-background pl-9"
          />
        </div>

        <div className="max-h-80 overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin motion-reduce:animate-none" />
              Memuat produk…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <SearchXIcon className="size-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Produk tidak ditemukan
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {items.map((p) => (
                <li key={p.itemGroupId}>
                  <button
                    type="button"
                    onClick={() => onPick(p)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/60"
                    )}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                      {p.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbnail}
                          alt={p.itemName}
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-medium">
                          {p.itemName}
                        </span>
                        {p.isBundle && (
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 text-[10px]"
                          >
                            Bundle
                          </Badge>
                        )}
                      </div>
                      <div className="truncate font-mono text-xs text-muted-foreground">
                        {p.sku ?? "—"}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
