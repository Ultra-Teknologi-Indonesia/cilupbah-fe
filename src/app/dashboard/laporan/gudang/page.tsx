import { PageTitle } from "@/components/dashboard/page-title";
import { LaporanGudangView } from "@/components/dashboard/laporan/gudang/laporan-gudang-view";

export default function LaporanGudangPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Laporan Gudang"
        description="Cetak laporan operasional gudang — transfer, picklist, pengiriman, dan performa proses."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Laporan" },
          { label: "Gudang" },
        ]}
      />

      <LaporanGudangView />
    </div>
  );
}
