import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { ProdukTabBar } from "@/components/dashboard/produk/produk-tab-bar"
import { NaikkanDetailView } from "@/components/dashboard/master-produk/naikkan/naikkan-detail-view"
import { TabBarSkeleton, TableSkeleton } from "@/components/ui/page-skeleton"

export default async function NaikkanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Detail Naikkan Produk"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Naikkan Produk", href: "/dashboard/produk/naikkan" },
          { label: "Detail" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <ProdukTabBar />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={6} cols={4} />}>
        <NaikkanDetailView id={id} />
      </Suspense>
    </div>
  )
}
