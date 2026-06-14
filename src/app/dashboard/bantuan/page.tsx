import { PageTitle } from "@/components/dashboard/page-title";

export default function BantuanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Bantuan"
        description="Temukan panduan penggunaan dan hubungi dukungan."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Bantuan" },
        ]}
      />
    </div>
  );
}
