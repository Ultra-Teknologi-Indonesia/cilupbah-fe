import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { ProsesPesananView } from "@/components/dashboard/proses-pesanan/proses-pesanan-view"

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

      <Suspense fallback={null}>
        <ProsesPesananView />
      </Suspense>
    </div>
  )
}
