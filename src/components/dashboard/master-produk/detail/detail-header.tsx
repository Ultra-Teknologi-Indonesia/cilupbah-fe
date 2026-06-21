"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon, ChevronRightIcon, ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

function Gallery({
  images,
  fallback,
  name,
}: {
  images: { url: string; isPrimary: boolean }[]
  fallback: string | null
  name: string
}) {
  const list = images.length ? images.map((i) => i.url) : fallback ? [fallback] : []
  const [idx, setIdx] = React.useState(0)
  const main = list[Math.min(idx, list.length - 1)]

  return (
    <div className="space-y-2">
      <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-xl border border-border bg-muted/30">
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={main} alt={name} className="size-full object-contain" />
        ) : (
          <ImageIcon className="size-10 text-muted-foreground" />
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {list.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Gambar ${i + 1}`}
              className={cn(
                "size-14 shrink-0 overflow-hidden rounded-lg border transition",
                i === idx
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${name} ${i + 1}`} className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}

export function DetailHeader({
  product,
  lifecyclePending,
  onLifecycle,
}: {
  product: ProductDetail
  lifecyclePending: boolean
  onLifecycle: (action: LifecycleAction, opts?: { reason?: string }) => void
}) {
  const [descOpen, setDescOpen] = React.useState(false)

  const price = product.priceRange
  const priceText = !price
    ? "—"
    : price.min === price.max
      ? formatIDR(price.min)
      : `${formatIDR(price.min)} – ${formatIDR(price.max)}`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 px-4 py-3 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild aria-label="Kembali">
            <Link href="/dashboard/master-produk" prefetch={false}>
              <ArrowLeftIcon /> Kembali
            </Link>
          </Button>
          <nav className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link href="/dashboard" prefetch={false} className="hover:text-foreground">Dashboard</Link>
            <ChevronRightIcon className="size-3" />
            <Link href="/dashboard/master-produk" prefetch={false} className="hover:text-foreground">Produk Master</Link>
            <ChevronRightIcon className="size-3" />
            <span className="truncate text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-xl sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold sm:text-2xl">{product.name}</h1>
            <ProductStatusBadge status={product.status} />
            <ProductTypeBadge type={product.productType} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusActions product={product} isPending={lifecyclePending} onAction={onLifecycle} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-[280px_1fr]">
          <Gallery images={product.images} fallback={product.primaryImage} name={product.name} />

          <div className="flex flex-col gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Harga</div>
              <div className="text-2xl font-bold tabular-nums">{priceText}</div>
              <div className="text-xs text-muted-foreground">{product.totalVariants} varian</div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <InfoRow label="SKU" value={product.sku ?? "—"} />
              <InfoRow label="Merek" value={product.brand?.name ?? "Tidak ada merek"} />
              <InfoRow label="Kategori" value={product.category?.name ?? "—"} />
            </div>

            {product.description && (
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Deskripsi</div>
                <div
                  className="prose-sm max-w-none line-clamp-4 text-sm leading-relaxed text-foreground/90 [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
                <button
                  type="button"
                  onClick={() => setDescOpen(true)}
                  className="mt-1 text-xs font-medium text-primary hover:underline"
                >
                  Lihat selengkapnya
                </button>
                <Dialog open={descOpen} onOpenChange={setDescOpen}>
                  <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Deskripsi Produk</DialogTitle>
                    </DialogHeader>
                    <div
                      className="prose-sm max-w-none text-sm leading-relaxed text-foreground/90 [&_a]:text-primary [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {product.status === "archived" && product.archiveReason && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
                Diarsipkan — {product.archiveReason}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
