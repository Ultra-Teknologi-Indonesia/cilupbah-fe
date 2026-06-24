import { PageTitle } from "@/components/dashboard/page-title"
import { KontakPemasokView } from "@/components/dashboard/kontak-pemasok/kontak-pemasok-view"

export default function KontakPemasokPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Kontak Pemasok"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pembelian" },
          { label: "Kontak Pemasok" },
        ]}
      />
      <KontakPemasokView />
    </div>
  )
}
