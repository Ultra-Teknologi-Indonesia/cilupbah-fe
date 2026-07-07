import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { TableSkeleton } from "@/components/ui/page-skeleton";
import { AktivitasImpexTabs } from "@/components/dashboard/impex/aktivitas-impex-tabs";
import { ImpexRefreshButton } from "@/components/dashboard/impex/impex-refresh-button";

export default function AktivitasImpexPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Aktivitas Import dan Export"
        breadcrumb={[
          { label: "Pengaturan Sistem" },
          { label: "Aktivitas Import dan Export" },
        ]}
        actions={<ImpexRefreshButton />}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
        <AktivitasImpexTabs />
      </Suspense>
    </div>
  );
}
