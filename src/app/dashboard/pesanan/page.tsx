import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { PesananView } from "@/components/dashboard/pesanan/pesanan-view"

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

      <Suspense fallback={null}>
        <PesananView />
      </Suspense>
    </div>
  )
}
