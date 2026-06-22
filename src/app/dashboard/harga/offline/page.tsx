import { PageTitle } from "@/components/dashboard/page-title"
import { HargaOfflineView } from "@/components/dashboard/harga/offline/harga-offline-view"

export default function HargaOfflinePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Harga"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Harga" },
          { label: "Harga Offline" },
        ]}
      />
      <HargaOfflineView />
    </div>
  )
}
