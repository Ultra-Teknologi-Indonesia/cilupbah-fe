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
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Detail Pengguna"
        backHref="/dashboard/pengaturan/pengguna"
        breadcrumb={[
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Daftar Pengguna", href: "/dashboard/pengaturan/pengguna" },
          { label: "Detail Pengguna" },
        ]}
      />
      <UserDetailPage userId={id} />
    </div>
  )
}
