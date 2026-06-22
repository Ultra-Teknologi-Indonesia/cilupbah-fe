import { PageTitle } from "@/components/dashboard/page-title"
import { PenyesuaianListView } from "@/components/dashboard/harga/penyesuaian/penyesuaian-list-view"

export default function PenyesuaianPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Harga"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Harga" },
          { label: "Penyesuaian" },
        ]}
      />
      <PenyesuaianListView />
    </div>
  )
}
