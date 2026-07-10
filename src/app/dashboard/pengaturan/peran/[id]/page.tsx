import { PageTitle } from "@/components/dashboard/page-title";
import { RoleDetailPage } from "@/components/dashboard/pengaturan/peran/role-detail-page";

export default async function PeranDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Detail Peran"
        backHref="/dashboard/pengaturan/peran"
        breadcrumb={[
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Peran & Hak Akses", href: "/dashboard/pengaturan/peran" },
          { label: "Detail Peran" },
        ]}
      />
      <RoleDetailPage id={id} />
    </div>
  );
}
