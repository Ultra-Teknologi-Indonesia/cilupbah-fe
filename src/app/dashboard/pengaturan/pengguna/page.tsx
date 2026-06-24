import { PageTitle } from "@/components/dashboard/page-title"
import { UserListView } from "@/components/dashboard/pengaturan/pengguna/user-list-view"

export default function PenggunaPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Daftar Pengguna"
        breadcrumb={[
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Daftar Pengguna" },
        ]}
      />
      <UserListView />
    </div>
  )
}
