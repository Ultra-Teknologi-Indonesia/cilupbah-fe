"use client"

import { use } from "react"
import { PenyesuaianDetail } from "@/components/dashboard/transaksi-stok/penyesuaian-detail"

export default function PenyesuaianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <PenyesuaianDetail id={id} />
}
