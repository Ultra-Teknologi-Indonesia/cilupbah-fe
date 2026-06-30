"use client"

import { use } from "react"
import { PurchaseReturnDetailView } from "@/components/dashboard/barang-keluar/purchase-return-detail-view"

export default function ReturPembelianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <PurchaseReturnDetailView returnId={id} />
}
