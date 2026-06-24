"use client"

import { use } from "react"
import { PageTitle } from "@/components/dashboard/page-title"
import { UserFormPage } from "@/components/dashboard/pengaturan/pengguna/user-form-page"

export default function EditPenggunaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <>
      <PageTitle
        title="Edit Pengguna"
        breadcrumb={[
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Daftar Pengguna", href: "/dashboard/pengaturan/pengguna" },
          { label: "Edit Pengguna" },
        ]}
      />
      <UserFormPage userId={id} />
    </>
  )
}
