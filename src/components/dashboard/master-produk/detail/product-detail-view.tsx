"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PackageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProductDetail, useProductLifecycle } from "@/hooks/master-produk/use-product-detail"
import type { ProductTypeKind } from "@/types/master-produk"
import { ProductDetailSkeleton } from "./product-detail-skeleton"
import { DetailHeader } from "./detail-header"
import { TabVariasi } from "./tab-variasi"
import { TabChannel } from "./tab-channel"
import { TabHargaChannel } from "./tab-harga-channel"
import { TabKomposisi } from "./tab-komposisi"
import { TabBukuHarga } from "./tab-buku-harga"
import { TabRiwayat } from "./tab-riwayat"
import { AccountsCard, ShippingCard } from "./accounts-shipping"

type DetailTab = { id: string; label: string }

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
            <Link href="/dashboard/produk">Kembali ke daftar</Link>
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
        onLifecycle={(action, opts) => lifecycle.mutate({ action, ...opts })}
      />

      <Tabs value={active} onValueChange={setTab} className="rounded-2xl border border-border/60 bg-card/50 shadow-sm">
        <div className="sticky top-0 z-10 overflow-x-auto rounded-t-2xl border-b border-border/60 bg-card/80 px-3 pt-3 backdrop-blur-xl">
          <TabsList variant="line" className="h-auto pb-2">
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="p-4 sm:p-5">
          <TabsContent value="variasi">
            <TabVariasi productId={id} />
          </TabsContent>
          <TabsContent value="komposisi">
            <TabKomposisi components={product.bundleComponents} bundleStock={product.bundleStock} />
          </TabsContent>
          <TabsContent value="channel">
            <TabChannel productId={id} />
          </TabsContent>
          <TabsContent value="harga-channel">
            <TabHargaChannel productId={id} />
          </TabsContent>
          <TabsContent value="buku-harga">
            <TabBukuHarga productId={id} />
          </TabsContent>
          <TabsContent value="riwayat">
            <TabRiwayat productId={id} />
          </TabsContent>
        </div>
      </Tabs>

      <div className="grid gap-4 lg:grid-cols-2">
        <AccountsCard product={product} />
        <ShippingCard product={product} />
      </div>
    </div>
  )
}
