import { PageTitle } from "@/components/dashboard/page-title"
import { PenyesuaianDetailView } from "@/components/dashboard/harga/penyesuaian/penyesuaian-detail-view"

export default async function PenyesuaianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Detail Penyesuaian"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Harga", href: "/dashboard/harga" },
          { label: "Penyesuaian", href: "/dashboard/harga/penyesuaian" },
          { label: "Detail" },
        ]}
      />
      <PenyesuaianDetailView id={id} />
    </div>
  )
}
