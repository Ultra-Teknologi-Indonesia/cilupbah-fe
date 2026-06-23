import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { PesananView } from "@/components/dashboard/pesanan/pesanan-view"
import { TableSkeleton } from "@/components/ui/page-skeleton"

export default function PesananPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Pesanan"
        description="Kelola pesanan dari semua channel penjualan."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Penjualan" },
          { label: "Pesanan" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={6} />}>
        <PesananView />
      </Suspense>
    </div>
  )
}
