import { PageTitle } from "@/components/dashboard/page-title";

export default function PengaturanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Pengaturan"
        description="Kelola preferensi akun dan konfigurasi aplikasi."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pengaturan" },
        ]}
      />
    </div>
  );
}
