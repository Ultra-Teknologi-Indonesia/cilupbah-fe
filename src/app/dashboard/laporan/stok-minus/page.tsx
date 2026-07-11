import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { NegativeStockView } from "@/components/dashboard/laporan/negative-stock-view";
import { TableSkeleton } from "@/components/ui/page-skeleton";

export default function LaporanStokMinusPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Riwayat Stok Minus"
        description="Lacak SKU + rak yang saldo bin-nya pernah minus setelah operasi gudang. Rekonsiliasi cepat ke petugas pemicu."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Laporan" },
          { label: "Riwayat Stok Minus" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={2} />}>
        <NegativeStockView />
      </Suspense>
    </div>
  );
}
