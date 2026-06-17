"use client"

import Link from "next/link"
import { ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Product } from "@/types/master-produk"
import { formatIDR } from "./product-columns"
import { ProductStatusBadge } from "./product-status-badge"
import { ProductChannelBadges } from "./product-channel-badges"
import { ProductRowActions } from "./product-row-actions"
import { ProductVariantPopover } from "./product-variant-popover"

interface ProductCardProps {
  product: Product
  selected: boolean
  onSelectedChange: (value: boolean) => void
}

export function ProductCard({
  product,
  selected,
  onSelectedChange,
}: ProductCardProps) {
  return (
    <div
      className={cn(

        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md",
        selected && "ring-2 ring-primary"
      )}
    >

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
      />

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
        {product.thumbnail ? (

          <img
            src={product.thumbnail}
            alt={product.itemName}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon className="size-8 text-muted-foreground" />
          </div>
        )}

        <div
          className={cn(
            "absolute left-2 top-2 transition-opacity",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Checkbox
            checked={selected}
            onCheckedChange={(v) => onSelectedChange(!!v)}
            aria-label="Pilih produk"
            className="border-transparent bg-background/95 shadow-sm"
          />
        </div>

        <div className="absolute right-2 top-2">
          <ProductStatusBadge
            status={product.status}

            className="border-transparent bg-background/95 shadow-sm ring-1 ring-black/5"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium leading-tight">
              <Link
                href={`/dashboard/master-produk/${product.itemGroupId}`}
                prefetch={false}
                className="hover:text-primary hover:underline"
              >
                {product.itemName}
              </Link>
            </h3>
            <p className="font-mono text-xs text-muted-foreground">
              {product.sku ?? "—"}
            </p>
          </div>
          <ProductRowActions product={product} />
        </div>

        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
          <span>{product.categoryName}</span>
          <span aria-hidden>·</span>
          <span>{product.brandName}</span>
          {product.isBundle && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
              Bundle
            </Badge>
          )}
          {product.isPo && (
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
              PO
            </Badge>
          )}
        </div>

        {product.variations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.variations.map((v) => (
              <span
                key={v.label}
                className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {v.label}: {v.values.length}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            <div className="text-base font-semibold tabular-nums">
              {formatIDR(product.sellPrice)}
            </div>
            <ProductVariantPopover product={product} />
          </div>
          <ProductChannelBadges channels={product.onlineStatus} max={4} />
        </div>
      </div>
    </div>
  )
}
