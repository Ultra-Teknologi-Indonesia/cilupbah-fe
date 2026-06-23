import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { ProdukTabBar } from "@/components/dashboard/produk/produk-tab-bar"
import { NaikkanStoreView } from "@/components/dashboard/master-produk/naikkan/naikkan-store-view"
import { TabBarSkeleton, TableSkeleton } from "@/components/ui/page-skeleton"

export default function NaikkanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Naikkan Produk"
        description="Naikkan produk di Shopee untuk meningkatkan visibilitas pencarian."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Produk" },
          { label: "Naikkan Produk" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <ProdukTabBar />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={6} cols={5} />}>
        <NaikkanStoreView />
      </Suspense>
    </div>
  )
}
