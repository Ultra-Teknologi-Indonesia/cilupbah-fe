import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { TableSkeleton } from "@/components/ui/page-skeleton";
import { TransaksiStokView } from "@/components/dashboard/transaksi-stok/transaksi-stok-view";

export default function TransaksiStokPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Transaksi Stok"
        breadcrumb={[{ label: "Persediaan" }, { label: "Transaksi Stok" }]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={5} />}>
        <TransaksiStokView />
      </Suspense>
    </div>
  );
}
