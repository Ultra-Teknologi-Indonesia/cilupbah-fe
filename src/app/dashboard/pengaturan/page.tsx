import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { PengaturanTabBar } from "@/components/dashboard/pengaturan/pengaturan-tab-bar";
import { TabBarSkeleton } from "@/components/ui/page-skeleton";

export default function PengaturanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Pengaturan"
        description="Kelola preferensi akun dan konfigurasi aplikasi."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pengaturan" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <PengaturanTabBar />
      </Suspense>
    </div>
  );
}
