import { Suspense } from "react"
import { PageTitle } from "@/components/dashboard/page-title"
import { TableSkeleton, TabBarSkeleton } from "@/components/ui/page-skeleton"
import { BarangMasukTabBar } from "@/components/dashboard/barang-masuk/barang-masuk-tab-bar"
import { PesananPembelianTab } from "@/components/dashboard/barang-masuk/pesanan-pembelian-tab"

export default function BarangMasukPesananPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Barang Masuk"
        description="Kelola penerimaan barang dari pembelian, transfer, dan retur channel."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Barang Masuk" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <BarangMasukTabBar />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
        <PesananPembelianTab />
      </Suspense>
    </div>
  )
}
