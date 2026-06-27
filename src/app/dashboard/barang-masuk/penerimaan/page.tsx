import { Suspense } from "react"
import { PageTitle } from "@/components/dashboard/page-title"
import { TableSkeleton, TabBarSkeleton } from "@/components/ui/page-skeleton"
import { BarangMasukTabBar } from "@/components/dashboard/barang-masuk/barang-masuk-tab-bar"
import { PenerimaanBarangTab } from "@/components/dashboard/barang-masuk/penerimaan-barang-tab"

export default function BarangMasukPenerimaanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Penerimaan Barang"
        description="Kelola dokumen riwayat penerimaan barang."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Barang Masuk", href: "/dashboard/barang-masuk" },
          { label: "Penerimaan Barang" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <BarangMasukTabBar />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
        <PenerimaanBarangTab />
      </Suspense>
    </div>
  )
}
