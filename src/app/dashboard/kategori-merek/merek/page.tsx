import { PageTitle } from "@/components/dashboard/page-title"
import { MerekView } from "@/components/dashboard/kategori-merek/merek-view"

export default function MerekPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Merek"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Kategori & Merek" },
          { label: "Merek" },
        ]}
      />
      <MerekView />
    </div>
  )
}
