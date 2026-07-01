import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { ProsesPesananPage } from "@/components/dashboard/proses-pesanan/proses-pesanan-page"
import { getServerQueryClient } from "@/lib/api-server"
import { OutboundService } from "@/services/proses-pesanan/outbound.service"
import type { FulfillmentListParams } from "@/types/proses-pesanan/fulfillment"

// Sub-tab default picking = "belum" → ReadyToProcessCardList →
// useOrdersByStage("ready-to-process", { page: 1, per_page: 20 }). Samakan
// agar data papan langsung tersedia dari hasil prefetch (tanpa fetch klien).
const READY_PARAMS: FulfillmentListParams = { page: 1, per_page: 20 }

export default async function PickingPage() {
  // Query key literal (bukan impor fulfillmentKeys yang berasal dari modul
  // "use client"). Harus persis sama dengan fulfillmentKeys.ordersByStage:
  //   ["proses-pesanan", "board", "orders", stage, params]
  const qc = getServerQueryClient()
  await qc.prefetchQuery({
    queryKey: ["proses-pesanan", "board", "orders", "ready-to-process", READY_PARAMS],
    queryFn: () => OutboundService.ordersByStage("ready-to-process", READY_PARAMS),
  })

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <ProsesPesananPage stage="picking" />
    </HydrationBoundary>
  )
}
