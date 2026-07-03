"use client";

import { use } from "react";
import { PindahBinEditView } from "@/components/dashboard/transaksi-stok/pindah-bin-edit-view";

export default function PindahBinEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PindahBinEditView id={id} />;
}
