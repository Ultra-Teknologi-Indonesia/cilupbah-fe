import { PageTitle } from "@/components/dashboard/page-title"
import { IntegrasiChannelView } from "@/components/dashboard/integrasi-channel/integrasi-channel-view"

export default function IntegrasiChannelPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Integrasi Channel"
        description="Hubungkan dan kelola akun toko marketplace Anda."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Penjualan" },
          { label: "Integrasi Channel" },
        ]}
      />

      <IntegrasiChannelView />
    </div>
  )
}
