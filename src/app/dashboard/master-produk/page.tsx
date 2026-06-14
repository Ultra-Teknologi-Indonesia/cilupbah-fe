import { PageTitle } from "@/components/dashboard/page-title"
import { ProductStats } from "./_components/product-stats"
import { ProductExplorer } from "./_components/product-explorer"
import { mockProducts } from "./_data/mock-products"

// Phase 1: fully hardcoded layout for review. Phase 2 swaps `mockProducts`
// for `GET products/master`. See PLAN-MASTER-PRODUK.md.
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
