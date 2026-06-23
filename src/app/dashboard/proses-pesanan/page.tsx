import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { ProsesPesananView } from "@/components/dashboard/proses-pesanan/proses-pesanan-view"
import { TableSkeleton } from "@/components/ui/page-skeleton"

export default function ProsesPesananPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Proses Pesanan"
        description="Kelola alur fulfillment: picking, packing, hingga pengiriman."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Proses Pesanan" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={6} />}>
        <ProsesPesananView />
      </Suspense>
    </div>
  )
}
