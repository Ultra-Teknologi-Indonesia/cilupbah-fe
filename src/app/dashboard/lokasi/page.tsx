import Link from "next/link"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/dashboard/page-title"
import { LocationListView } from "@/components/dashboard/manajemen-rak/lokasi/location-list-view"

export default function LokasiPage() {
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
              Tambah baru
            </Link>
          </Button>
        }
      />

      <LocationListView />
    </div>
  )
}
