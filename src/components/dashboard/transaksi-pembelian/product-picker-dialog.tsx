"use client"

import * as React from "react"
import { ImageIcon, Loader2Icon, SearchIcon, SearchXIcon, CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMasterProducts } from "@/hooks/master-produk/use-master-products"

export interface PickedProduct {
  itemId: string
  sku: string
  name: string
  thumbnail: string | null
  sellPrice: number | null
}

interface ProductPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (products: PickedProduct[]) => void
  excludeIds?: string[]
}

export function ProductPickerDialog({
  open,
  onOpenChange,
  onPick,
  excludeIds = [],
}: ProductPickerDialogProps) {
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<Map<string, PickedProduct>>(new Map())

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSearchInput("")
      setSearch("")
      setSelected(new Map())
    }
    onOpenChange(next)
  }

  const { data, isLoading } = useMasterProducts({
    search: search || undefined,
    perPage: 20,
  })

  const variants = React.useMemo(() => {
    const result: (PickedProduct & { productName: string; thumbnail: string | null; isBundle: boolean })[] = []
    for (const p of data?.items ?? []) {
      for (const v of p.variants) {
        if (excludeIds.includes(v.itemId)) continue
        result.push({
          itemId: v.itemId,
          sku: v.sku,
          name: p.itemName,
          productName: p.itemName,
          thumbnail: p.thumbnail,
          sellPrice: v.sellPrice,
          isBundle: p.isBundle,
        })
      }
    }
    return result
  }, [data, excludeIds])

  const toggleSelect = (v: (typeof variants)[0]) => {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(v.itemId)) {
        next.delete(v.itemId)
      } else {
        next.set(v.itemId, {
          itemId: v.itemId,
          sku: v.sku,
          name: v.productName,
          thumbnail: v.thumbnail,
          sellPrice: v.sellPrice,
        })
      }
      return next
    })
  }

  const handleConfirm = () => {
    onPick(Array.from(selected.values()))
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Pilih Produk</DialogTitle>
          <DialogDescription>
            Cari dan pilih produk untuk ditambahkan ke pesanan.
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
              <Loader2Icon className="size-4 animate-spin" />
              Memuat produk…
            </div>
          ) : variants.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <SearchXIcon className="size-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Produk tidak ditemukan</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {variants.map((v) => {
                const isSelected = selected.has(v.itemId)
                return (
                  <li key={v.itemId}>
                    <button
                      type="button"
                      onClick={() => toggleSelect(v)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                        isSelected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/60"
                      )}
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                        {v.thumbnail ? (
                          <img
                            src={v.thumbnail}
                            alt={v.productName}
                            className="size-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                              e.currentTarget.nextElementSibling?.classList.remove("hidden")
                            }}
                          />
                        ) : null}
                        <ImageIcon className={cn("size-4 text-muted-foreground", v.thumbnail && "hidden")} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-medium">{v.productName}</span>
                          {v.isBundle && (
                            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">Bundle</Badge>
                          )}
                        </div>
                        <div className="truncate font-mono text-xs text-muted-foreground">{v.sku}</div>
                      </div>

                      {isSelected && (
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <CheckIcon className="size-3" />
                        </div>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={selected.size === 0}>
            Tambah {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
