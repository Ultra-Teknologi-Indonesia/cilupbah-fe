import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { PengaturanTabBar } from "@/components/dashboard/pengaturan/pengaturan-tab-bar";
import { SyncStokHargaView } from "@/components/dashboard/persediaan/sync-stok-harga-view";
import { TabBarSkeleton } from "@/components/ui/page-skeleton";

export default function PengaturanPersediaanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Sinkronisasi Stok & Harga"
        description="Atur sinkronisasi stok & harga tiap produk ke masing-masing store channel."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Sinkronisasi Stok & Harga" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <PengaturanTabBar />
      </Suspense>

      <SyncStokHargaView />
    </div>
  );
}
