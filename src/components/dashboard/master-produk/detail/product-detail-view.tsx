"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ChevronRightIcon, ImageIcon, PackageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useProductDetail, useProductLifecycle } from "@/hooks/master-produk/use-product-detail"
import { formatIDR } from "../product-columns"
import { ProductStatusBadge } from "../product-status-badge"
import { ProductDetailSkeleton } from "./product-detail-skeleton"
import { StatusActions } from "./status-actions"
import { VariantTable } from "./variant-table"
import { ChannelListing } from "./channel-listing"
import { AccountsCard, ShippingCard } from "./accounts-shipping"

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/40 px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-base font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function Section({
  title,
  count,
  children,
}: {
  title: string
  count?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        {count != null && (
          <span className="text-xs text-muted-foreground">{count}</span>
        )}
      </div>
      {children}
    </section>
  )
}

export function ProductDetailView({ id }: { id: string }) {
  const { data: product, isLoading, isError, refetch } = useProductDetail(id)
  const lifecycle = useProductLifecycle(id)

  if (isLoading) return <ProductDetailSkeleton />

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
        <PackageIcon className="size-7 text-muted-foreground" />
        <p className="text-sm font-medium">Produk tidak ditemukan</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Coba lagi
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/dashboard/master-produk">Kembali ke daftar</Link>
          </Button>
        </div>
      </div>
    )
  }

  const price = product.priceRange
  const priceText = !price
    ? "—"
    : price.min === price.max
      ? formatIDR(price.min)
      : `${formatIDR(price.min)} – ${formatIDR(price.max)}`

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <ChevronRightIcon className="size-3" />
        <span>Katalog</span>
        <ChevronRightIcon className="size-3" />
        <Link href="/dashboard/master-produk" className="hover:text-foreground">Produk Master</Link>
        <ChevronRightIcon className="size-3" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="flex flex-wrap items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted/40">
          {product.primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.primaryImage} alt={product.name} className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-5 text-muted-foreground" />
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
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.brand?.name ?? "Tanpa merek"} · {product.category?.name ?? "—"} ·{" "}
            {product.isActive ? "Aktif" : "Nonaktif"}
          </p>
        </div>
        <StatusActions
          product={product}
          isPending={lifecycle.isPending}
          onAction={(action, reason) => lifecycle.mutate({ action, reason })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Status" value={<ProductStatusBadge status={product.status} />} />
        <Metric label="Rentang harga" value={priceText} />
        <Metric label="Varian" value={product.variants.length} />
        <Metric label="Channel" value={`${product.channelsCount ?? product.channelMappings.length} toko`} />
      </div>

      {product.status === "archived" && product.archiveReason && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Diarsipkan — {product.archiveReason}
        </div>
      )}

      {product.description && (
        <Section title="Deskripsi">
          <div
            className="prose-sm max-w-none text-sm leading-relaxed text-foreground/90 [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </Section>
      )}

      <Section title="Varian" count={`${product.variants.length} varian`}>
        <VariantTable variants={product.variants} />
      </Section>

      <Section title="Channel & listing">
        <ChannelListing mappings={product.channelMappings} />
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <AccountsCard product={product} />
        <ShippingCard product={product} />
      </div>
    </div>
  )
}
