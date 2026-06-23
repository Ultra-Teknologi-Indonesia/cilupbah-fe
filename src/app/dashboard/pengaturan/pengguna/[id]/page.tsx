"use client"

import { use } from "react"
import { PageTitle } from "@/components/dashboard/page-title"
import { UserDetailPage } from "@/components/dashboard/pengaturan/pengguna/user-detail-page"

export default function PenggunaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <>
      <PageTitle
        title="Detail Pengguna"
        breadcrumb={[
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Daftar Pengguna", href: "/dashboard/pengaturan/pengguna" },
          { label: "Detail Pengguna" },
        ]}
      />
      <UserDetailPage userId={id} />
    </>
  )
}
