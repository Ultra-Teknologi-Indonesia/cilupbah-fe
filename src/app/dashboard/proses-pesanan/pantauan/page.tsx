import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { ProsesPesananPage } from "@/components/dashboard/proses-pesanan/proses-pesanan-page";
import { getServerQueryClient } from "@/lib/api-server";
import { OutboundService } from "@/services/proses-pesanan/outbound.service";

export default async function PantauanPage() {
  const qc = getServerQueryClient();
  await qc.prefetchQuery({
    queryKey: ["proses-pesanan", "board", "monitoring"],
    queryFn: () => OutboundService.monitoring(),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <ProsesPesananPage stage="pantauan" />
    </HydrationBoundary>
  );
}
