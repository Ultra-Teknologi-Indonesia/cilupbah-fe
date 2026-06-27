import { Suspense } from "react"
import { PageTitle } from "@/components/dashboard/page-title"
import { TableSkeleton, TabBarSkeleton } from "@/components/ui/page-skeleton"
import { BarangMasukTabBar } from "@/components/dashboard/barang-masuk/barang-masuk-tab-bar"
import { TransferMasukTab } from "@/components/dashboard/barang-masuk/transfer-masuk-tab"

export default function BarangMasukTransferPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Transfer Masuk"
        description="Kelola penerimaan barang dari transfer antar lokasi."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Barang Masuk", href: "/dashboard/barang-masuk" },
          { label: "Transfer Masuk" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <BarangMasukTabBar />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
        <TransferMasukTab />
      </Suspense>
    </div>
  )
}
