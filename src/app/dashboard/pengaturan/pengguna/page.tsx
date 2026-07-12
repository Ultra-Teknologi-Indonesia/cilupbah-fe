import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageTitle } from "@/components/dashboard/page-title";
import { PengaturanTabBar } from "@/components/dashboard/pengaturan/pengaturan-tab-bar";
import { UserListView } from "@/components/dashboard/pengaturan/pengguna/user-list-view";
import { TabBarSkeleton } from "@/components/ui/page-skeleton";
import { getServerQueryClient } from "@/lib/api-server";
import { UserService } from "@/services/pengaturan/user.service";
import type { UserListParams } from "@/types/pengaturan/user";

const INITIAL_PARAMS: UserListParams = { search: "", page: 1, perPage: 20 };

export default async function PenggunaPage() {
  const qc = getServerQueryClient();
  await qc.prefetchQuery({
    queryKey: ["pengaturan", "pengguna", "list", INITIAL_PARAMS],
    queryFn: () => UserService.list(INITIAL_PARAMS),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Daftar Pengguna"
        breadcrumb={[
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Daftar Pengguna" },
        ]}
      />

      <Suspense fallback={<TabBarSkeleton />}>
        <PengaturanTabBar />
      </Suspense>

      <HydrationBoundary state={dehydrate(qc)}>
        <UserListView />
      </HydrationBoundary>
    </div>
  );
}
