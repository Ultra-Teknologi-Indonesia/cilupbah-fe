import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { PageTitle } from "@/components/dashboard/page-title"
import { IntegrasiChannelView } from "@/components/dashboard/integrasi-channel/integrasi-channel-view"
import { getServerQueryClient } from "@/lib/api-server"
import { ChannelService } from "@/services/channel/channel.service"

export default async function IntegrasiChannelPage() {
  // Prefetch daftar toko terhubung agar IntegrasiChannelView hydrate dengan
  // data (tanpa round-trip fetch klien). Query key ditulis literal, harus persis
  // sama dengan CHANNEL_STORES_KEY (["channel","stores"]) yang berasal dari modul
  // "use client"; impor ke Server Component akan menjadikannya client-reference.
  // prefetchQuery menelan error → bila gagal, klien fetch seperti biasa.
  const qc = getServerQueryClient()
  await qc.prefetchQuery({
    queryKey: ["channel", "stores"],
    queryFn: () => ChannelService.listStores(),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Integrasi Channel"
        description="Hubungkan dan kelola akun toko marketplace Anda."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Penjualan" },
          { label: "Integrasi Channel" },
        ]}
      />

      <HydrationBoundary state={dehydrate(qc)}>
        <IntegrasiChannelView />
      </HydrationBoundary>
    </div>
  )
}
