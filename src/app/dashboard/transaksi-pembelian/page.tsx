import { Suspense } from "react"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { PageTitle } from "@/components/dashboard/page-title"
import { TableSkeleton } from "@/components/ui/page-skeleton"
import { PesananListView } from "@/components/dashboard/transaksi-pembelian/pesanan-list-view"
import { getServerQueryClient } from "@/lib/api-server"
import { PurchaseOrderService } from "@/services/transaksi-pembelian/purchase-order.service"
import type { PurchaseOrderListParams } from "@/types/transaksi-pembelian/purchase-order"

// HARUS sama dengan render pertama PesananListView (usePurchaseOrders). Field
// undefined tidak memengaruhi hash query key, jadi cukup samakan field yang
// bernilai (page/per_page). Bila default view berubah, sesuaikan di sini.
const INITIAL_PARAMS: PurchaseOrderListParams = { page: 1, per_page: 20 }

export default async function TransaksiPembelianPage() {
  // Prefetch di server (pola sama dengan dashboard/pesanan): data list ikut
  // HTML sehingga view hydrate tanpa round-trip fetch klien; bila prefetch
  // gagal, klien fetch seperti biasa (fallback aman).
  const qc = getServerQueryClient()
  await qc.prefetchQuery({
    queryKey: ["purchase-order", "list", INITIAL_PARAMS],
    queryFn: () => PurchaseOrderService.list(INITIAL_PARAMS),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Transaksi Pembelian"
        description="Kelola pesanan pembelian dari pemasok."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pembelian" },
          { label: "Transaksi Pembelian" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
        <HydrationBoundary state={dehydrate(qc)}>
          <PesananListView />
        </HydrationBoundary>
      </Suspense>
    </div>
  )
}
