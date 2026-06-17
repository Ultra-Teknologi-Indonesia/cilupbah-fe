import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { ProdukTabBar } from "@/components/dashboard/produk/produk-tab-bar"
import { DownloadView } from "@/components/dashboard/master-produk/download/download-view"

export default function DownloadPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Download"
        description="Tarik produk dari marketplace ke katalog."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Produk" },
          { label: "Download" },
        ]}
      />

      <Suspense fallback={null}>
        <ProdukTabBar />
      </Suspense>

      <Suspense fallback={null}>
        <DownloadView />
      </Suspense>
    </div>
  )
}
