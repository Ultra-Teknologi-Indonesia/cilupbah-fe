import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { PengaturanTabBar } from "@/components/dashboard/pengaturan/pengaturan-tab-bar";
import { InventorySettingsView } from "@/components/dashboard/persediaan/inventory-settings-view";
import { TabBarSkeleton } from "@/components/ui/page-skeleton";

export default function PengaturanPersediaanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Pengaturan Persediaan"
        description="Atur batas stok, alokasi rak, dan sinkronisasi stok & harga tiap produk."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Pengaturan Persediaan" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <PengaturanTabBar />
      </Suspense>

      <InventorySettingsView />
    </div>
  );
}
