import { PageTitle } from "@/components/dashboard/page-title"
import { HargaOnlineView } from "@/components/dashboard/harga/online/harga-online-view"

export default function HargaOnlinePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Harga"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Harga" },
          { label: "Harga Online" },
        ]}
      />
      <HargaOnlineView />
    </div>
  )
}
