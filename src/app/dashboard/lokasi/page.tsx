import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/dashboard/page-title"
import { LocationListView } from "@/components/dashboard/manajemen-rak/lokasi/location-list-view"
import { getServerQueryClient } from "@/lib/api-server"
import { LocationService } from "@/services/manajemen-rak/location.service"
import type { LocationListParams } from "@/types/manajemen-rak/location"

// HARUS sama dengan render pertama LocationListView (useLocations). Di render
// pertama search = "" (string kosong, bukan undefined) sehingga ikut hash key.
// Query key ditulis literal, harus persis sama dengan locationKeys.list(params) =
// ["pengaturan","lokasi","list", params] dari modul "use client".
const INITIAL_PARAMS: LocationListParams = { search: "", page: 1, perPage: 20 }

export default async function LokasiPage() {
  // Prefetch di server: list lokasi mengalir bersama HTML, view langsung hydrate
  // tanpa round-trip fetch klien. prefetchQuery menelan error → bila gagal,
  // klien fetch seperti biasa (fallback aman).
  const qc = getServerQueryClient()
  await qc.prefetchQuery({
    queryKey: ["pengaturan", "lokasi", "list", INITIAL_PARAMS],
    queryFn: () => LocationService.list(INITIAL_PARAMS),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Lokasi Gudang"
        description="Kelola gudang dan lokasi penyimpanan."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Manajemen Rak & Lokasi" },
          { label: "Lokasi Gudang" },
        ]}
        actions={
          <Button variant="primary" asChild>
            <Link href="/dashboard/lokasi/buat">
              <PlusIcon />
              Buat Lokasi
            </Link>
          </Button>
        }
      />

      <HydrationBoundary state={dehydrate(qc)}>
        <LocationListView />
      </HydrationBoundary>
    </div>
  )
}
