"use client"

import { use } from "react"
import { TagihanDetailView } from "@/components/dashboard/transaksi-pembelian/tagihan-detail-view"

export default function DetailTagihanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <TagihanDetailView id={id} />
}
