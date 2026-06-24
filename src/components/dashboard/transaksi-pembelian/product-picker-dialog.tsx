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
  variantLabel: string
  thumbnail: string | null
  sellPrice: number | null
}

interface ProductPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (products: PickedProduct[]) => void
  excludeIds?: string[]
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val)
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

  const products = React.useMemo(() => {
    const result: {
      itemGroupId: string
      itemName: string
      thumbnail: string | null
      isBundle: boolean
      categoryName: string
      variants: {
        itemId: string
        sku: string
        sellPrice: number | null
        variationValues: { label: string; value: string }[]
      }[]
    }[] = []

    for (const p of data?.items ?? []) {
      const filteredVariants = p.variants.filter((v) => !excludeIds.includes(v.itemId))
      if (filteredVariants.length === 0) continue
      result.push({
        itemGroupId: p.itemGroupId,
        itemName: p.itemName,
        thumbnail: p.thumbnail,
        isBundle: p.isBundle,
        categoryName: p.categoryName,
        variants: filteredVariants.map((v) => ({
          itemId: v.itemId,
          sku: v.sku,
          sellPrice: v.sellPrice,
          variationValues: v.variationValues,
        })),
      })
    }
    return result
  }, [data, excludeIds])

  const toggleSelect = (product: (typeof products)[0], variant: (typeof products)[0]["variants"][0]) => {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(variant.itemId)) {
        next.delete(variant.itemId)
      } else {
        next.set(variant.itemId, {
          itemId: variant.itemId,
          sku: variant.sku,
          name: product.itemName,
          variantLabel: variant.variationValues.map((v) => v.value).join(", "),
          thumbnail: product.thumbnail,
          sellPrice: variant.sellPrice,
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
      <DialogContent className="max-w-3xl">
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
            placeholder="Cari nama produk / SKU…"
            className="h-10 rounded-full border-border bg-background pl-9"
          />
        </div>

        <div className="max-h-[28rem] overflow-y-auto overscroll-contain -mx-1 px-1">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Memuat produk…
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <SearchXIcon className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Produk tidak ditemukan</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((p) => (
                <div key={p.itemGroupId} className="rounded-xl border border-border/50 bg-background/50">
                  <div className="flex items-center gap-3 border-b border-border/30 px-4 py-3">
                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt={p.itemName}
                          className="size-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                            e.currentTarget.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      <ImageIcon className={cn("size-4 text-muted-foreground", p.thumbnail && "hidden")} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{p.itemName}</span>
                        {p.isBundle && (
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">Bundle</Badge>
                        )}
                      </div>
                      {p.categoryName && (
                        <div className="text-xs text-muted-foreground">{p.categoryName}</div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.variants.length} varian
                    </div>
                  </div>

                  <div className="divide-y divide-border/20">
                    {p.variants.map((v) => {
                      const isSelected = selected.has(v.itemId)
                      const variantLabel = v.variationValues.map((vv) => vv.value).join(" / ")
                      return (
                        <button
                          key={v.itemId}
                          type="button"
                          onClick={() => toggleSelect(p, v)}
                          className={cn(
                            "flex w-full items-center gap-4 px-4 py-2.5 text-left transition-colors",
                            isSelected ? "bg-primary/8" : "hover:bg-muted/40"
                          )}
                        >
                          <div className="w-11 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {variantLabel && (
                                <span className="text-sm font-medium">{variantLabel}</span>
                              )}
                              {!variantLabel && (
                                <span className="text-sm text-muted-foreground">Default</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-mono">{v.sku}</span>
                              {v.variationValues.map((vv) => (
                                <Badge key={vv.label} variant="outline" className="px-1.5 py-0 text-[10px] font-normal">
                                  {vv.label}: {vv.value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="shrink-0 text-right text-sm tabular-nums">
                            {v.sellPrice != null ? formatCurrency(v.sellPrice) : "—"}
                          </div>
                          <div className="flex size-5 shrink-0 items-center justify-center">
                            {isSelected ? (
                              <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <CheckIcon className="size-3" />
                              </div>
                            ) : (
                              <div className="size-4 rounded-full border-2 border-muted-foreground/30" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex-1 text-sm text-muted-foreground">
            {selected.size > 0 && `${selected.size} varian dipilih`}
          </div>
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
