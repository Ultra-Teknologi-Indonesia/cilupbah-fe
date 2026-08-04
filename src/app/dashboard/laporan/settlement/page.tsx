import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { SettlementView } from "@/components/dashboard/laporan/settlement/settlement-view";
import { TableSkeleton } from "@/components/ui/page-skeleton";

export default function LaporanSettlementPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Laporan Settlement"
        description="Rekap pencairan dana marketplace per pesanan — gross, biaya, net settlement, dan status pencairan."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Laporan" },
          { label: "Settlement" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={2} />}>
        <SettlementView />
      </Suspense>
    </div>
  );
}
