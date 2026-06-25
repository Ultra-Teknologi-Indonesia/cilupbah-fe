"use client"

import { PageTitle } from "@/components/dashboard/page-title"
import { MonitorStokView } from "@/components/dashboard/monitor-stok/monitor-stok-view"

export default function MonitorStokPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Monitor Stok"
        description="Pantau stok kosong, menipis, dan pembelian berjalan untuk keputusan restock."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Persediaan" },
          { label: "Monitor Stok" },
        ]}
      />

      <MonitorStokView />
    </div>
  )
}
