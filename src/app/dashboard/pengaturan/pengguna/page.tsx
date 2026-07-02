import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { PageTitle } from "@/components/dashboard/page-title"
import { UserListView } from "@/components/dashboard/pengaturan/pengguna/user-list-view"
import { getServerQueryClient } from "@/lib/api-server"
import { UserService } from "@/services/pengaturan/user.service"
import type { UserListParams } from "@/types/pengaturan/user"

// HARUS sama dengan render pertama UserListView (useUsers). Di render pertama
// search = "" (string kosong, bukan undefined) sehingga field ini ikut hash key.
// Query key ditulis literal, harus persis sama dengan userKeys.list(params) =
// ["pengaturan","pengguna","list", params] dari modul "use client".
const INITIAL_PARAMS: UserListParams = { search: "", page: 1, perPage: 20 }

export default async function PenggunaPage() {
  // Prefetch di server: list pengguna mengalir bersama HTML, view langsung
  // hydrate tanpa round-trip fetch klien. prefetchQuery menelan error → bila
  // backend/auth gagal, klien fetch seperti biasa (fallback aman).
  const qc = getServerQueryClient()
  await qc.prefetchQuery({
    queryKey: ["pengaturan", "pengguna", "list", INITIAL_PARAMS],
    queryFn: () => UserService.list(INITIAL_PARAMS),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Daftar Pengguna"
        breadcrumb={[
          { label: "Pengaturan", href: "/dashboard/pengaturan" },
          { label: "Daftar Pengguna" },
        ]}
      />
      <HydrationBoundary state={dehydrate(qc)}>
        <UserListView />
      </HydrationBoundary>
    </div>
  )
}
