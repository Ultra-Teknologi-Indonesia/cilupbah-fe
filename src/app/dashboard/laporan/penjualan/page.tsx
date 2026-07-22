import { PageTitle } from "@/components/dashboard/page-title";
import { PenjualanView } from "@/components/dashboard/laporan/penjualan/penjualan-view";

export default function LaporanPenjualanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Laporan Penjualan"
        description="Cetak laporan penjualan — daftar penjualan, produk, retur, pendapatan, dan pelanggan."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Laporan" },
          { label: "Penjualan" },
        ]}
      />

      <PenjualanView />
    </div>
  );
}
