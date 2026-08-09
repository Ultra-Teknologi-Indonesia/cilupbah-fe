import { PageTitle } from "@/components/dashboard/page-title";
import { PengaturanTabBar } from "@/components/dashboard/pengaturan/pengaturan-tab-bar";
import { StockAllocationList } from "@/components/dashboard/pengaturan/alokasi-stok/stock-allocation-list";

export default function PengaturanAlokasiStokPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Pengaturan Alokasi Stok dan Channel"
        description="Atur sumber stok available yang dikirim ke tiap toko marketplace: stok total atau stok satu gudang pilihan."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Alokasi Stok & Channel" },
        ]}
      />

      <PengaturanTabBar />

      <StockAllocationList />
    </div>
  );
}
