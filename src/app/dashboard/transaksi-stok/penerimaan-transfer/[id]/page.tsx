"use client";

import { use } from "react";
import { PenerimaanTransferDetailView } from "@/components/dashboard/transaksi-stok/penerimaan-transfer-detail-view";

export default function PenerimaanTransferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PenerimaanTransferDetailView id={id} />;
}
