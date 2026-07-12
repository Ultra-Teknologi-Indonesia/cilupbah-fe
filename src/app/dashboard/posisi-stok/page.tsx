import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageTitle } from "@/components/dashboard/page-title";
import { PosisiStokView } from "@/components/dashboard/persediaan/posisi-stok-view";
import { TableSkeleton } from "@/components/ui/page-skeleton";
import { getServerQueryClient } from "@/lib/api-server";
import { InventoryStockService } from "@/services/persediaan/inventory.service";
import type { StockListParams } from "@/types/persediaan/stock";

const INITIAL_PARAMS: StockListParams = { page: 1, per_page: 20 };

export default async function PosisiStokPage() {
  const qc = getServerQueryClient();
  await qc.prefetchQuery({
    queryKey: ["inventory", "list", INITIAL_PARAMS],
    queryFn: () => InventoryStockService.list(INITIAL_PARAMS),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Posisi Stok"
        description="Pantau posisi stok produk di semua lokasi gudang."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Persediaan" },
          { label: "Posisi Stok" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={8} cols={6} />}>
        <HydrationBoundary state={dehydrate(qc)}>
          <PosisiStokView />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
