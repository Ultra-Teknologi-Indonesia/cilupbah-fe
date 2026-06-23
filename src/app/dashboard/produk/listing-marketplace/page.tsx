import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { ProdukTabBar } from "@/components/dashboard/produk/produk-tab-bar"
import { ListingMarketplaceView } from "@/components/dashboard/master-produk/listing-marketplace/listing-view"
import { TabBarSkeleton } from "@/components/ui/page-skeleton"

export default function ListingMarketplacePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Produk Channel"
        description="Kelola koneksi SKU produk dengan listing di marketplace."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Produk Channel" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <ProdukTabBar />
      </Suspense>

      <ListingMarketplaceView />
    </div>
  )
}
