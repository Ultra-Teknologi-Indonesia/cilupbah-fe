import { PageTitle } from "@/components/dashboard/page-title"
import { UserFormPage } from "@/components/dashboard/pengaturan/pengguna/user-form-page"

export default function TambahPenggunaPage() {
  return (
    <>
      <PageTitle
        title="Tambah Pengguna"
        breadcrumb={[
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Daftar Pengguna", href: "/dashboard/pengaturan/pengguna" },
          { label: "Tambah Pengguna" },
        ]}
      />
      <UserFormPage />
    </>
  )
}
