import { PageTitle } from "@/components/dashboard/page-title"
import { UserFormPage } from "@/components/dashboard/pengaturan/pengguna/user-form-page"

export default function TambahPenggunaPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Buat Pengguna"
        backHref="/dashboard/pengaturan/pengguna"
        breadcrumb={[
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Daftar Pengguna", href: "/dashboard/pengaturan/pengguna" },
          { label: "Buat Pengguna" },
        ]}
      />
      <UserFormPage />
    </div>
  )
}
