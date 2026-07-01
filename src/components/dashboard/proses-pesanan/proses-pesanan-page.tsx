import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { TableSkeleton } from "@/components/ui/page-skeleton"
import type { FulfillmentStage } from "@/types/proses-pesanan/fulfillment"

import { ProsesPesananView } from "./proses-pesanan-view"

export function ProsesPesananPage({ stage }: { stage: FulfillmentStage }) {
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
        <ProsesPesananView stage={stage} />
      </Suspense>
    </div>
  )
}
