import { PageTitle } from "@/components/dashboard/page-title"
import { UserListView } from "@/components/dashboard/pengaturan/pengguna/user-list-view"

export default function PenggunaPage() {
  return (
    <>
      <PageTitle
        title="Daftar Pengguna"
        breadcrumb={[
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Daftar Pengguna" },
        ]}
      />
      <UserListView />
    </>
  )
}
