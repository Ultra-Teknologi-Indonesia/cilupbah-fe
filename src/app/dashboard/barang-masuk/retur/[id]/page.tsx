"use client"

import { use } from "react"
import { SalesReturnDetailView } from "@/components/dashboard/barang-masuk/sales-return-detail-view"

export default function SalesReturnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <SalesReturnDetailView id={id} />
}
