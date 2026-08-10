import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { ProdukTabBar } from "@/components/dashboard/produk/produk-tab-bar";
import { MergeCatalogView } from "@/components/dashboard/master-produk/gabung/merge-catalog-view";
import { TabBarSkeleton } from "@/components/ui/page-skeleton";

export default function GabungProdukPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Gabung Produk"
        description="Satukan produk kembar dari beberapa link marketplace menjadi satu produk master."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Produk", href: "/dashboard/produk" },
          { label: "Gabung" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <ProdukTabBar />
      </Suspense>

      <MergeCatalogView />
    </div>
  );
}
