import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { HppReportView } from "@/components/dashboard/laporan/hpp-report-view"
import { TableSkeleton } from "@/components/ui/page-skeleton"

export default function LaporanHppPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Laporan HPP"
        description="Laporan Harga Pokok Penjualan berdasarkan metode Moving Average."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Laporan" },
          { label: "Harga Pokok Penjualan" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={2} />}>
        <HppReportView />
      </Suspense>
    </div>
  )
}
