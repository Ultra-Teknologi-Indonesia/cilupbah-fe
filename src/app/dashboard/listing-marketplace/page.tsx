import { PageTitle } from "@/components/dashboard/page-title"
import { ListingMarketplaceView } from "@/components/dashboard/master-produk/listing-marketplace/listing-view"

export default function ListingMarketplacePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Produk Channel"
        description="Kelola koneksi SKU produk dengan listing di marketplace."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Produk Channel" },
        ]}
      />

      <ListingMarketplaceView />
    </div>
  )
}
