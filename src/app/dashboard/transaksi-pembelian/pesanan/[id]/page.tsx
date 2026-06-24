"use client"

import { use } from "react"
import { PesananDetailView } from "@/components/dashboard/transaksi-pembelian/pesanan-detail-view"

export default function DetailPesananPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <PesananDetailView id={id} />
}
