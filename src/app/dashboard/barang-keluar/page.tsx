import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { TableSkeleton } from "@/components/ui/page-skeleton";
import { TransferKeluarTab } from "@/components/dashboard/barang-keluar/transfer-keluar-tab";

export default function BarangKeluarPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Barang Keluar"
        description="Kelola pengeluaran barang melalui transfer antar lokasi."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Barang Keluar" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
        <TransferKeluarTab />
      </Suspense>
    </div>
  );
}
