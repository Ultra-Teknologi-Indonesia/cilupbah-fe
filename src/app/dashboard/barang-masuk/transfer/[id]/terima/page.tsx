"use client";

import { useParams } from "next/navigation";
import { TerimaTransferMasukView } from "@/components/dashboard/barang-masuk/terima-transfer-masuk-view";

export default function TerimaTransferMasukPage() {
  const params = useParams();
  const id = params.id as string;

  return <TerimaTransferMasukView id={id} />;
}
