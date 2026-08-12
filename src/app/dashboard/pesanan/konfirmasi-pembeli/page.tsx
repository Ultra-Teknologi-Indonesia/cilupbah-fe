import { PageTitle } from "@/components/dashboard/page-title";
import { BuyerConfirmationView } from "@/components/dashboard/pesanan/buyer-confirmation-view";

export default function KonfirmasiPembeliPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Konfirmasi Pembeli"
        description="Pesanan yang tertahan karena stok Gudang Kecil kosong, beserta yang sedang menunggu stok masuk."
        backHref="/dashboard/pesanan"
        breadcrumb={[
          { label: "Penjualan" },
          { label: "Pesanan", href: "/dashboard/pesanan" },
          { label: "Konfirmasi Pembeli" },
        ]}
      />
      <BuyerConfirmationView />
    </div>
  );
}
