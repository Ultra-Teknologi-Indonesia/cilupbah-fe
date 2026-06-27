"use client"

import * as React from "react"
import Image from "next/image"
import { ImageIcon, Loader2Icon, SearchIcon, SearchXIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { useInfiniteMasterProducts } from "@/hooks/master-produk/use-master-products"

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

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMasterProducts(
    { search: search || undefined, perPage: 20 },
    { enabled: open }
  )

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

    for (const p of data?.pages.flatMap((pg) => pg.items) ?? []) {
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

  // Infinite scroll: amati sentinel di dasar viewport ScrollArea
  const scrollWrapRef = React.useRef<HTMLDivElement>(null)
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const root = scrollWrapRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    )
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { root, rootMargin: "300px" }
    )
    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, products.length])

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
      <DialogContent className="flex h-[85vh] max-h-[90vh] w-[95vw] flex-col gap-0 p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>Pilih Produk</DialogTitle>
          <DialogDescription>
            Cari dan pilih produk untuk ditambahkan ke pesanan.
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 px-6 py-4">
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
        </div>

        <div ref={scrollWrapRef} className="flex min-h-0 flex-1 flex-col border-t">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Memuat produk…
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
              <SearchXIcon className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Produk tidak ditemukan</p>
            </div>
          ) : (
            <ScrollArea className="min-h-0 flex-1">
              <Table className="min-w-max">
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-9 w-10" />
                    <TableHead className="h-9">Varian</TableHead>
                    <TableHead className="h-9">SKU</TableHead>
                    <TableHead className="h-9">Atribut</TableHead>
                    <TableHead className="h-9 text-right">Harga</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <React.Fragment key={p.itemGroupId}>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableCell colSpan={5} className="py-2">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                              {p.thumbnail ? (
                                <Image
                                  src={p.thumbnail}
                                  alt={p.itemName}
                                  width={40}
                                  height={40}
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
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {p.variants.length} varian
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>

                      {p.variants.map((v) => {
                        const isSelected = selected.has(v.itemId)
                        const variantLabel = v.variationValues.map((vv) => vv.value).join(" / ")
                        return (
                          <TableRow
                            key={v.itemId}
                            data-state={isSelected ? "selected" : undefined}
                            onClick={() => toggleSelect(p, v)}
                            className="cursor-pointer"
                          >
                            <TableCell className="py-2">
                              <Checkbox
                                checked={isSelected}
                                aria-hidden
                                tabIndex={-1}
                                className="pointer-events-none"
                              />
                            </TableCell>
                            <TableCell className="py-2">
                              <span className="text-sm font-medium">
                                {variantLabel || "Default"}
                              </span>
                            </TableCell>
                            <TableCell className="py-2 font-mono text-xs text-muted-foreground">
                              {v.sku || "—"}
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex flex-wrap gap-1">
                                {v.variationValues.map((vv) => (
                                  <Badge key={vv.label} variant="outline" className="px-1.5 py-0 text-[10px] font-normal">
                                    {vv.label}: {vv.value}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="py-2 text-right text-sm tabular-nums">
                              {v.sellPrice != null ? formatCurrency(v.sellPrice) : "—"}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>

              {/* Sentinel + indikator lazy-load */}
              <div ref={sentinelRef} className="h-px w-full" />
              {isFetchingNextPage && (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                  <Loader2Icon className="size-3.5 animate-spin" />
                  Memuat lebih banyak…
                </div>
              )}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="shrink-0 items-center gap-2 border-t px-6 py-4 sm:gap-0">
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
