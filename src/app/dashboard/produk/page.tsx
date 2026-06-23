import { Suspense } from "react"
import Link from "next/link"
import { ArchiveIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/dashboard/page-title"
import { ProdukTabBar } from "@/components/dashboard/produk/produk-tab-bar"
import { ProductMasterView } from "@/components/dashboard/master-produk/product-master-view"
import { TabBarSkeleton, TableSkeleton } from "@/components/ui/page-skeleton"

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
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/produk/arsip">
              <ArchiveIcon />
              Arsip
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <ProdukTabBar />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={6} cols={5} />}>
        <ProductMasterView />
      </Suspense>
    </div>
  )
}
