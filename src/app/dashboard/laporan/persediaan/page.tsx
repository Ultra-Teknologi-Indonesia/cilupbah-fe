import { PageTitle } from "@/components/dashboard/page-title";
import { LaporanPersediaanView } from "@/components/dashboard/laporan/persediaan/laporan-persediaan-view";

export default function LaporanPersediaanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Laporan Persediaan"
        description="Cetak label QR barang dan daftar penyesuaian stok."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Laporan" },
          { label: "Persediaan" },
        ]}
      />

      <LaporanPersediaanView />
    </div>
  );
}
