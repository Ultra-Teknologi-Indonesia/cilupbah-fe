import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { PosisiStokView } from "@/components/dashboard/persediaan/posisi-stok-view"
import { TableSkeleton } from "@/components/ui/page-skeleton"

export default function PosisiStokPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Posisi Stok"
        description="Pantau posisi stok produk di semua lokasi gudang."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Persediaan" },
          { label: "Posisi Stok" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={8} cols={6} />}>
        <PosisiStokView />
      </Suspense>
    </div>
  )
}
