import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { PageTitle } from "@/components/dashboard/page-title"
import { MonitorStokView } from "@/components/dashboard/monitor-stok/monitor-stok-view"
import { getServerQueryClient } from "@/lib/api-server"
import { MonitorStockService } from "@/services/monitor-stok/monitor-stok.service"
import type { MonitorListParams } from "@/types/monitor-stok/monitor"

// HARUS sama dengan render pertama MonitorStokView. Tab default "stok-kosong"
// (stock tab) dengan subMode "habis" → useMonitorList("stok-kosong","habis",
// listParams). listParams render pertama hanya bernilai page/per_page (filter
// undefined tidak memengaruhi hash). Query key ditulis literal, persis sama
// dengan useMonitorList: ["monitor-stok", tab, mode, params] dan
// useMonitorSummary: ["monitor-stok","summary", params] dari modul "use client".
const INITIAL_LIST_PARAMS: MonitorListParams = { page: 1, per_page: 20 }
const INITIAL_SUMMARY_PARAMS: MonitorListParams = {}

export default async function MonitorStokPage() {
  // Prefetch di server: list tab default (stok-kosong/habis) + summary mengalir
  // bersama HTML sehingga view hydrate tanpa round-trip fetch klien. prefetchQuery
  // menelan error → bila gagal, klien fetch seperti biasa (fallback aman).
  const qc = getServerQueryClient()
  await Promise.all([
    qc.prefetchQuery({
      queryKey: ["monitor-stok", "stok-kosong", "habis", INITIAL_LIST_PARAMS],
      queryFn: () => MonitorStockService.outOfStock("habis", INITIAL_LIST_PARAMS),
    }),
    qc.prefetchQuery({
      queryKey: ["monitor-stok", "summary", INITIAL_SUMMARY_PARAMS],
      queryFn: () => MonitorStockService.summary(INITIAL_SUMMARY_PARAMS),
    }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Monitor Stok"
        description="Pantau stok kosong, menipis, dan pembelian berjalan untuk keputusan restock."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Persediaan" },
          { label: "Monitor Stok" },
        ]}
      />

      <HydrationBoundary state={dehydrate(qc)}>
        <MonitorStokView />
      </HydrationBoundary>
    </div>
  )
}
