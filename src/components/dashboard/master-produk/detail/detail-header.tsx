"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRightIcon, ImageIcon, PencilIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ProductStatusBadge } from "../product-status-badge"
import { formatIDR } from "../product-columns"
import { StatusActions } from "./status-actions"
import type { LifecycleAction } from "@/services/master-produk/product-detail.service"
import type { ProductDetail, ProductTypeKind } from "@/types/master-produk"

const TYPE_LABEL: Record<ProductTypeKind, string> = {
  single: "Satuan",
  variant: "Varian",
  bundle: "Bundle",
}
const TYPE_STYLE: Record<ProductTypeKind, string> = {
  single: "bg-muted text-foreground/70",
  variant: "bg-primary/10 text-primary",
  bundle: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
}

function ProductTypeBadge({ type }: { type: ProductTypeKind }) {
  return (
    <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", TYPE_STYLE[type])}>
      {TYPE_LABEL[type]}
    </span>
  )
}

export function DetailHeader({
  product,
  lifecyclePending,
  onLifecycle,
}: {
  product: ProductDetail
  lifecyclePending: boolean
  onLifecycle: (action: LifecycleAction, reason?: string) => void
}) {
  const [expanded, setExpanded] = React.useState(false)

  const price = product.priceRange
  const priceText = !price
    ? "—"
    : price.min === price.max
      ? formatIDR(price.min)
      : `${formatIDR(price.min)} – ${formatIDR(price.max)}`

  return (
    <div className="flex flex-col gap-4">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <ChevronRightIcon className="size-3" />
        <Link href="/dashboard/master-produk" className="hover:text-foreground">Produk Master</Link>
        <ChevronRightIcon className="size-3" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      {/* Liquid glass header card */}
      <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-xl sm:p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted/40">
            {product.primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.primaryImage} alt={product.name} className="size-full object-cover" />
            ) : (
              <ImageIcon className="size-6 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{product.name}</h1>
              {product.sku && (
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {product.sku}
                </span>
              )}
              <ProductStatusBadge status={product.status} />
              <ProductTypeBadge type={product.productType} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.brand?.name ?? "Tanpa merek"} · {product.category?.name ?? "—"} ·{" "}
              {product.isActive ? "Aktif" : "Nonaktif"}
            </p>
            <div className="mt-2 text-sm">
              <span className="text-muted-foreground">Rentang harga: </span>
              <span className="font-semibold tabular-nums">{priceText}</span>
              <span className="text-muted-foreground"> · {product.totalVariants} varian</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild disabled={lifecyclePending}>
              <Link href={`/dashboard/master-produk/${product.id}/edit`}>
                <PencilIcon /> Edit
              </Link>
            </Button>
            <StatusActions
              product={product}
              isPending={lifecyclePending}
              onAction={onLifecycle}
            />
          </div>
        </div>

        {product.description && (
          <div className="mt-4 border-t border-border/50 pt-3">
            <div
              className={cn(
                "prose-sm max-w-none text-sm leading-relaxed text-foreground/90 [&_a]:text-primary [&_a]:underline",
                !expanded && "line-clamp-3"
              )}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? "Lebih sedikit" : "Lihat selengkapnya"}
            </button>
          </div>
        )}

        {product.status === "archived" && product.archiveReason && (
          <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
            Diarsipkan — {product.archiveReason}
          </div>
        )}
      </div>
    </div>
  )
}
