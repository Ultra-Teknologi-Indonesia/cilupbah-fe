import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageTitle } from "@/components/dashboard/page-title";
import { PesananView } from "@/components/dashboard/pesanan/pesanan-view";
import { TableSkeleton } from "@/components/ui/page-skeleton";
import { getServerQueryClient } from "@/lib/api-server";
import { OrderService } from "@/services/pesanan/order.service";
import type { OrderListParams } from "@/types/pesanan/order";

const INITIAL_ORDER_PARAMS: OrderListParams = {
  tab: "all",
  page: 1,
  per_page: 24,
};

export default async function PesananPage() {
  // dari modul "use client"; impor ke Server Component akan menjadikannya

  const qc = getServerQueryClient();
  await Promise.all([
    qc.prefetchQuery({
      queryKey: ["pesanan", "list", INITIAL_ORDER_PARAMS],
      queryFn: () => OrderService.list(INITIAL_ORDER_PARAMS),
    }),
    qc.prefetchQuery({
      queryKey: ["pesanan", "counts"],
      queryFn: () => OrderService.getCounts(),
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Pesanan"
        description="Kelola pesanan dari semua channel penjualan."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Penjualan" },
          { label: "Pesanan" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={6} />}>
        <HydrationBoundary state={dehydrate(qc)}>
          <PesananView />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
