import { PageTitle } from "@/components/dashboard/page-title"
import { ProductStats } from "@/components/dashboard/master-produk/product-stats"
import { ProductExplorer } from "@/components/dashboard/master-produk/product-explorer"
import { mockProducts } from "@/mocks/master-produk/mock-products"

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

      <ProductStats products={mockProducts} />

      <ProductExplorer data={mockProducts} />
    </div>
  )
}
