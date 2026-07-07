import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { PenyesuaianStokReportView } from "@/components/dashboard/laporan/penyesuaian-stok/penyesuaian-stok-report-view";
import { TableSkeleton } from "@/components/ui/page-skeleton";

export default function LaporanPenyesuaianStokPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Laporan Penyesuaian Stok"
        description="Daftar penyesuaian stok per SKU pada rentang tanggal dan lokasi tertentu."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Laporan" },
          { label: "Penyesuaian Stok" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={2} />}>
        <PenyesuaianStokReportView />
      </Suspense>
    </div>
  );
}
