import { Suspense } from "react"
import Link from "next/link"
import { ArchiveIcon } from "lucide-react"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/dashboard/page-title"
import { ProdukTabBar } from "@/components/dashboard/produk/produk-tab-bar"
import { ProductMasterView } from "@/components/dashboard/master-produk/product-master-view"
import { TabBarSkeleton, TableSkeleton } from "@/components/ui/page-skeleton"
import { getServerQueryClient } from "@/lib/api-server"
import {
  ProductListService,
  type MasterProductsParams,
} from "@/services/master-produk/product-list.service"

export default async function ProdukMasterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  // `status` berasal dari URL (useProductListQuery membacanya juga), jadi ikut
  // disamakan agar hash query key match saat deep-link ?status=…. Field
  // undefined lain (search/categoryId/sort) tidak memengaruhi hash.
  const { status } = await searchParams
  const params: MasterProductsParams = {
    status: status || undefined,
    page: 1,
    perPage: 24,
  }

  const qc = getServerQueryClient()
  await qc.prefetchQuery({
    queryKey: ["master-produk", "list", params],
    queryFn: () => ProductListService.getMasterProducts(params),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Produk Master"
        description="Kelola katalog produk induk, varian, harga, dan status channel."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Produk Master" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/produk/arsip">
              <ArchiveIcon />
              Arsip
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <ProdukTabBar />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={6} cols={5} />}>
        <HydrationBoundary state={dehydrate(qc)}>
          <ProductMasterView />
        </HydrationBoundary>
      </Suspense>
    </div>
  )
}
