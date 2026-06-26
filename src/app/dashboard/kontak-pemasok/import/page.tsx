import { PageTitle } from "@/components/dashboard/page-title"
import { ImportPemasokView } from "@/components/dashboard/kontak-pemasok/import-pemasok-view"

export default function ImportPemasokPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Import Kontak"
        backHref="/dashboard/kontak-pemasok"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pembelian" },
          { label: "Kontak Pemasok", href: "/dashboard/kontak-pemasok" },
          { label: "Import" },
        ]}
      />
      <ImportPemasokView />
    </div>
  )
}
