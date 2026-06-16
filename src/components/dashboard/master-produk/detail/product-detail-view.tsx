"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PackageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useProductDetail, useProductLifecycle } from "@/hooks/master-produk/use-product-detail"
import type { ProductTypeKind } from "@/types/master-produk"
import { ProductDetailSkeleton } from "./product-detail-skeleton"
import { DetailHeader } from "./detail-header"
import { DetailTabs, type DetailTab } from "./detail-tabs"
import { TabVariasi } from "./tab-variasi"
import { ChannelListing } from "./channel-listing"
import { AccountsCard, ShippingCard } from "./accounts-shipping"

function tabsFor(type: ProductTypeKind): DetailTab[] {
  const first: DetailTab =
    type === "bundle"
      ? { id: "komposisi", label: "Komposisi" }
      : { id: "variasi", label: "Variasi" }
  return [
    first,
    { id: "channel", label: "Channel" },
    { id: "harga-channel", label: "Harga Channel" },
    { id: "buku-harga", label: "Buku Harga" },
    { id: "riwayat", label: "Riwayat Upload" },
  ]
}

function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 px-6 py-12 text-center text-sm text-muted-foreground">
      Tab &ldquo;{label}&rdquo; akan dimuat per-halaman (segera).
    </div>
  )
}

export function ProductDetailView({ id }: { id: string }) {
  const { data: product, isLoading, isError, refetch } = useProductDetail(id)
  const lifecycle = useProductLifecycle(id)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tabs = React.useMemo(() => tabsFor(product?.productType ?? "single"), [product?.productType])
  const urlTab = searchParams.get("tab")
  const active = tabs.some((t) => t.id === urlTab) ? (urlTab as string) : tabs[0].id

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

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

  return (
    <div className="flex flex-col gap-5">
      <DetailHeader
        product={product}
        lifecyclePending={lifecycle.isPending}
        onLifecycle={(action, reason) => lifecycle.mutate({ action, reason })}
      />

      <div className="rounded-2xl border border-border/60 bg-card/50 shadow-sm">
        <DetailTabs tabs={tabs} active={active} onChange={setTab} />

        <div role="tabpanel" className="p-4 sm:p-5">
          {active === "variasi" && <TabVariasi productId={id} />}
          {active === "channel" && <ChannelListing mappings={product.channelMappings} />}
          {active === "komposisi" && <TabPlaceholder label="Komposisi" />}
          {active === "harga-channel" && <TabPlaceholder label="Harga Channel" />}
          {active === "buku-harga" && <TabPlaceholder label="Buku Harga" />}
          {active === "riwayat" && <TabPlaceholder label="Riwayat Upload" />}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AccountsCard product={product} />
        <ShippingCard product={product} />
      </div>
    </div>
  )
}
