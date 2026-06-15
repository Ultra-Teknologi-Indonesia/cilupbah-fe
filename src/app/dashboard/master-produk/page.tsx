import { PageTitle } from "@/components/dashboard/page-title"
import { ProductMasterView } from "@/components/dashboard/master-produk/product-master-view"

export default function ProdukMasterPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Produk Master"
        description="Kelola katalog produk induk, varian, harga, dan status channel."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Produk Master" },
        ]}
      />

      <ProductMasterView />
    </div>
  )
}
