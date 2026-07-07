import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { BarcodeReportView } from "@/components/dashboard/laporan/barcode/barcode-report-view";
import { TableSkeleton } from "@/components/ui/page-skeleton";

export default function LaporanBarcodeBarangPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Laporan Barcode Barang"
        description="Cetak label barcode per SKU atau SKU induk, dengan atau tanpa harga."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Laporan" },
          { label: "Barcode Barang" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={2} />}>
        <BarcodeReportView />
      </Suspense>
    </div>
  );
}
