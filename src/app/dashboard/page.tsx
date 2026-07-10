import { PageTitle } from "@/components/dashboard/page-title";
import { Beranda } from "@/components/dashboard/beranda/beranda";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Dashboard"
        description="Ringkasan operasional & penjualan 30 hari terakhir beserta antrian yang perlu ditindak."
      />

      <Beranda />
    </div>
  );
}
