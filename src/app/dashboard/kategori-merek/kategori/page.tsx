import { PageTitle } from "@/components/dashboard/page-title"
import { KategoriView } from "@/components/dashboard/kategori-merek/kategori-view"

export default function KategoriPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Kategori"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Kategori & Merek" },
          { label: "Kategori" },
        ]}
      />
      <KategoriView />
    </div>
  )
}
