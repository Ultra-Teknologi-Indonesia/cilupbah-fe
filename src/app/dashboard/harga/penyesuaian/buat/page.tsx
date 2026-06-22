import { PageTitle } from "@/components/dashboard/page-title"
import { PenyesuaianForm } from "@/components/dashboard/harga/penyesuaian/penyesuaian-form"

export default function BuatPenyesuaianPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Buat Penyesuaian"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Harga", href: "/dashboard/harga" },
          { label: "Penyesuaian", href: "/dashboard/harga/penyesuaian" },
          { label: "Buat" },
        ]}
      />
      <PenyesuaianForm />
    </div>
  )
}
