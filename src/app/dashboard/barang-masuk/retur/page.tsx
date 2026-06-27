import { Suspense } from "react"
import { PageTitle } from "@/components/dashboard/page-title"
import { TableSkeleton, TabBarSkeleton } from "@/components/ui/page-skeleton"
import { BarangMasukTabBar } from "@/components/dashboard/barang-masuk/barang-masuk-tab-bar"
import { ReturChannelTab } from "@/components/dashboard/barang-masuk/retur-channel-tab"

export default function BarangMasukReturPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Retur dari Channel Online"
        description="Kelola penerimaan barang dari retur pelanggan channel online."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Barang Masuk", href: "/dashboard/barang-masuk" },
          { label: "Retur dari Channel" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <BarangMasukTabBar />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
        <ReturChannelTab />
      </Suspense>
    </div>
  )
}
