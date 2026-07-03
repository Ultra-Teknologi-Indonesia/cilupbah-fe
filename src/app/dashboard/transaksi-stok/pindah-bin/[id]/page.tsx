"use client";

import { use } from "react";
import { PindahBinDetailView } from "@/components/dashboard/transaksi-stok/pindah-bin-detail-view";

export default function PindahBinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PindahBinDetailView id={id} />;
}
