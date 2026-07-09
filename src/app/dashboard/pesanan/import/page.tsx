import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { OrderImportView } from "@/components/dashboard/pesanan/import/import-view";
import { TableSkeleton } from "@/components/ui/page-skeleton";

export default function OrderImportPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Import Pesanan"
        description="Import pesanan massal dari file Excel."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pesanan", href: "/dashboard/pesanan" },
          { label: "Import" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={5} />}>
        <OrderImportView />
      </Suspense>
    </div>
  );
}
