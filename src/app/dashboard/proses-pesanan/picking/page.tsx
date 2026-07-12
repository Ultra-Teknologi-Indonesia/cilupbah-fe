import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { ProsesPesananPage } from "@/components/dashboard/proses-pesanan/proses-pesanan-page";
import { getServerQueryClient } from "@/lib/api-server";
import { OutboundService } from "@/services/proses-pesanan/outbound.service";
import type { FulfillmentListParams } from "@/types/proses-pesanan/fulfillment";

const READY_PARAMS: FulfillmentListParams = { page: 1, per_page: 20 };

export default async function PickingPage() {

  const qc = getServerQueryClient();
  await qc.prefetchQuery({
    queryKey: [
      "proses-pesanan",
      "board",
      "orders",
      "ready-to-process",
      READY_PARAMS,
    ],
    queryFn: () =>
      OutboundService.ordersByStage("ready-to-process", READY_PARAMS),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <ProsesPesananPage stage="picking" />
    </HydrationBoundary>
  );
}
