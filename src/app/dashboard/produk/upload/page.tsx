import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { ProdukTabBar } from "@/components/dashboard/produk/produk-tab-bar"
import { UploadMassalView } from "@/components/dashboard/master-produk/upload/upload-massal-view"
import { TabBarSkeleton, TableSkeleton } from "@/components/ui/page-skeleton"

export default function UploadMassalPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Upload Massal"
        description="Upload produk master ke marketplace."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Produk" },
          { label: "Upload Massal" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <ProdukTabBar />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={6} cols={5} />}>
        <UploadMassalView />
      </Suspense>
    </div>
  )
}
