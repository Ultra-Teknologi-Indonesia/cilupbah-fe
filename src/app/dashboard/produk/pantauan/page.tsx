import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { ProdukTabBar } from "@/components/dashboard/produk/produk-tab-bar"
import { PantauanView } from "@/components/dashboard/master-produk/pantauan/pantauan-view"

export default function PantauanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Pantauan"
        description="Pantau produk yang belum diupload dan yang datanya tidak seragam antar channel."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Produk" },
          { label: "Pantauan" },
        ]}
      />

      <Suspense fallback={null}>
        <ProdukTabBar />
      </Suspense>

      <Suspense fallback={null}>
        <PantauanView />
      </Suspense>
    </div>
  )
}
