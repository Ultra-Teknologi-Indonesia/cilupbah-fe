import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageTitle } from "@/components/dashboard/page-title";
import { LocationListView } from "@/components/dashboard/manajemen-rak/lokasi/location-list-view";
import { getServerQueryClient } from "@/lib/api-server";
import { LocationService } from "@/services/manajemen-rak/location.service";
import type { LocationListParams } from "@/types/manajemen-rak/location";

const INITIAL_PARAMS: LocationListParams = {
  search: "",
  page: 1,
  perPage: 20,
  excludeTransit: false,
};

export default async function LokasiPage() {
  const qc = getServerQueryClient();
  await qc.prefetchQuery({
    queryKey: ["pengaturan", "lokasi", "list", INITIAL_PARAMS],
    queryFn: () => LocationService.list(INITIAL_PARAMS),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Lokasi Gudang"
        description="Kelola gudang dan lokasi penyimpanan."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Manajemen Rak & Lokasi" },
          { label: "Lokasi Gudang" },
        ]}
      />

      <HydrationBoundary state={dehydrate(qc)}>
        <LocationListView />
      </HydrationBoundary>
    </div>
  );
}
