"use client"

import { use } from "react"
import { OpnameDetail } from "@/components/dashboard/transaksi-stok/opname-detail"

export default function OpnameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <OpnameDetail id={id} />
}
