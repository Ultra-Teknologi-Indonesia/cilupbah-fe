"use client"

import { use } from "react"
import { CadangDetail } from "@/components/dashboard/transaksi-stok/cadang-detail"

export default function CadangDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <CadangDetail id={id} />
}
