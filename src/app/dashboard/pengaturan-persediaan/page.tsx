import { PageTitle } from "@/components/dashboard/page-title";
import { SyncStokHargaView } from "@/components/dashboard/persediaan/sync-stok-harga-view";

export default function PengaturanPersediaanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Pengaturan Persediaan"
        description="Atur sinkronisasi stok & harga tiap produk ke masing-masing store channel."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Persediaan" },
          { label: "Pengaturan Persediaan" },
        ]}
      />

      <SyncStokHargaView />
    </div>
  );
}
