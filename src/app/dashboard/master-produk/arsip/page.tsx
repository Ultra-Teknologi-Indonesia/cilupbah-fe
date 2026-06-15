import { PageTitle } from "@/components/dashboard/page-title"
import { ArchiveView } from "@/components/dashboard/master-produk/arsip/archive-view"

export default function ArsipProdukPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Arsip Produk"
        description="Produk yang diarsipkan. Pulihkan untuk mengembalikannya ke katalog."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Produk Master", href: "/dashboard/master-produk" },
          { label: "Arsip" },
        ]}
      />

      <ArchiveView />
    </div>
  )
}
