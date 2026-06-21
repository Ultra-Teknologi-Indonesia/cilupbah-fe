import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { ProdukTabBar } from "@/components/dashboard/produk/produk-tab-bar"
import { ImportView } from "@/components/dashboard/master-produk/import/import-view"

export default function ImportPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Import"
        description="Import produk massal dari file Excel."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Produk" },
          { label: "Import" },
        ]}
      />

      <Suspense fallback={null}>
        <ProdukTabBar />
      </Suspense>

      <Suspense fallback={null}>
        <ImportView />
      </Suspense>
    </div>
  )
}
