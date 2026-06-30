"use client"

import { use } from "react"
import { TransferOutDetailView } from "@/components/dashboard/barang-keluar/transfer-out-detail-view"

export default function TransferKeluarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <TransferOutDetailView transferId={id} />
}
