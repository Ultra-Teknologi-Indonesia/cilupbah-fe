import { Suspense } from "react"
import { PageTitle } from "@/components/dashboard/page-title"
import { TableSkeleton, TabBarSkeleton } from "@/components/ui/page-skeleton"
import { BarangMasukTabBar } from "@/components/dashboard/barang-masuk/barang-masuk-tab-bar"
import { PenempatanBarangTab } from "@/components/dashboard/barang-masuk/penempatan-barang-tab"

export default function BarangMasukPenempatanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Penempatan Barang"
        description="Kelola dokumen penempatan barang (Putaway) ke lokasi rak."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Barang Masuk", href: "/dashboard/barang-masuk" },
          { label: "Penempatan Barang" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <BarangMasukTabBar />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
        <PenempatanBarangTab />
      </Suspense>
    </div>
  )
}
