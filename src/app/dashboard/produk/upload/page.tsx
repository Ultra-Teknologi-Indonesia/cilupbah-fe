import { PageTitle } from "@/components/dashboard/page-title"
import { UploadView } from "@/components/dashboard/master-produk/upload/upload-view"

export default function UploadProdukPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Upload ke Marketplace"
        description="Kirim produk master ke toko marketplace yang terhubung."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Upload ke Marketplace" },
        ]}
      />

      <UploadView />
    </div>
  )
}
