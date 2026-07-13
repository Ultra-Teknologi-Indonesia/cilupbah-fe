import { Suspense } from "react";

import { PageTitle } from "@/components/dashboard/page-title";
import { PageHeaderSkeleton } from "@/components/ui/page-skeleton";
import { BantuanTabs } from "@/components/bantuan/bantuan-tabs";

export const metadata = {
  title: "Bantuan",
};

export default function BantuanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Bantuan"
        description="FAQ, panduan pengguna per modul, dan dokumentasi API. Semua data dapat disalin ke asisten AI."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Bantuan" },
        ]}
      />
      <Suspense fallback={<PageHeaderSkeleton />}>
        <BantuanTabs />
      </Suspense>
    </div>
  );
}
