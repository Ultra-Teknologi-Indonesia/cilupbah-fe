"use client"

import { use } from "react"
import { RevaluasiDetail } from "@/components/dashboard/transaksi-stok/revaluasi-detail"

export default function RevaluasiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <RevaluasiDetail id={id} />
}
