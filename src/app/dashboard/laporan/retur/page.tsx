import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { LaporanReturView } from "@/components/dashboard/laporan/laporan-retur-view";
import { TableSkeleton } from "@/components/ui/page-skeleton";

export default function LaporanReturPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Laporan Retur"
        description="Rekonsiliasi retur pengembalian barang & dana dengan status settlement, refund, dan keputusan marketplace."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Laporan" },
          { label: "Retur" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={2} />}>
        <LaporanReturView />
      </Suspense>
    </div>
  );
}
