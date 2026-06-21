import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { ProdukTabBar } from "@/components/dashboard/produk/produk-tab-bar"
import { NaikkanStoreView } from "@/components/dashboard/master-produk/naikkan/naikkan-store-view"

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

      <Suspense fallback={null}>
        <ProdukTabBar />
      </Suspense>

      <Suspense fallback={null}>
        <NaikkanStoreView />
      </Suspense>
    </div>
  )
}
