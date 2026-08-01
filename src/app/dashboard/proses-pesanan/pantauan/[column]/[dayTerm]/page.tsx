import { notFound } from "next/navigation";

import { PageTitle } from "@/components/dashboard/page-title";
import { PantauanDetailView } from "@/components/dashboard/proses-pesanan/pantauan/pantauan-detail-view";
import {
  isValidDayTerm,
  pantauanColumnBySlug,
} from "@/types/proses-pesanan/pantauan-drilldown";

export default async function PantauanDetailPage({
  params,
}: {
  params: Promise<{ column: string; dayTerm: string }>;
}) {
  const { column: columnSlug, dayTerm: dayTermRaw } = await params;

  const column = pantauanColumnBySlug(columnSlug);
  const dayTerm = Number(dayTermRaw);

  if (!column || !Number.isInteger(dayTerm) || !isValidDayTerm(dayTerm)) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Proses Pesanan"
        description="Kelola alur fulfillment: picking, packing, hingga pengiriman."
        backHref="/dashboard/proses-pesanan/pantauan"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          {
            label: "Proses Pesanan",
            href: "/dashboard/proses-pesanan/pantauan",
          },
          { label: column.label },
        ]}
      />

      <PantauanDetailView column={column} dayTerm={dayTerm} />
    </div>
  );
}
