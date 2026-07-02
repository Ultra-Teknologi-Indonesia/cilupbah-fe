import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { PageTitle } from "@/components/dashboard/page-title"
import { KontakPemasokView } from "@/components/dashboard/kontak-pemasok/kontak-pemasok-view"
import { getServerQueryClient } from "@/lib/api-server"
import { ContactService } from "@/services/kontak-pemasok/contact.service"
import type { ContactListParams } from "@/types/kontak-pemasok/contact"

// HARUS sama dengan render pertama KontakPemasokView (useContacts). Field
// undefined tidak memengaruhi hash query key, jadi cukup samakan field yang
// bernilai (page/per_page). Bila default view berubah, sesuaikan di sini.
const INITIAL_PARAMS: ContactListParams = { page: 1, per_page: 20 }

export default async function KontakPemasokPage() {
  // Prefetch di server (pola sama dengan dashboard/pesanan): list + kategori
  // ikut HTML sehingga view hydrate tanpa round-trip fetch klien; bila
  // prefetch gagal, klien fetch seperti biasa (fallback aman).
  const qc = getServerQueryClient()
  await Promise.all([
    qc.prefetchQuery({
      queryKey: ["contact", "list", INITIAL_PARAMS],
      queryFn: () => ContactService.list(INITIAL_PARAMS),
    }),
    qc.prefetchQuery({
      queryKey: ["contact", "categories"],
      queryFn: () => ContactService.getCategories(),
    }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Kontak Pemasok"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pembelian" },
          { label: "Kontak Pemasok" },
        ]}
      />
      <HydrationBoundary state={dehydrate(qc)}>
        <KontakPemasokView />
      </HydrationBoundary>
    </div>
  )
}
