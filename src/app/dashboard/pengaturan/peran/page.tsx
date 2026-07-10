import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { PengaturanTabBar } from "@/components/dashboard/pengaturan/pengaturan-tab-bar";
import { RoleListView } from "@/components/dashboard/pengaturan/peran/role-list-view";
import { TabBarSkeleton } from "@/components/ui/page-skeleton";

export default function PeranPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Peran & Hak Akses"
        breadcrumb={[
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Peran & Hak Akses" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <PengaturanTabBar />
      </Suspense>

      <RoleListView />
    </div>
  );
}
