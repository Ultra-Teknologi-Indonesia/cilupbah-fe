"use client"

import { PageTitle } from "@/components/dashboard/page-title"
import { SalesReturnSettingForm } from "@/components/dashboard/pengaturan/retur/sales-return-setting-form"

export default function PengaturanReturPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Pengaturan Retur Penjualan"
        description="Atur alur auto-terima, auto-restock, lokasi, dan kebijakan retur."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Retur Penjualan" },
        ]}
      />
      <SalesReturnSettingForm />
    </div>
  )
}
