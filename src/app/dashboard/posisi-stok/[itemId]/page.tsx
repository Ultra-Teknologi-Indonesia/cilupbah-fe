"use client"

import { useParams } from "next/navigation"
import { StockPositionDetailView } from "@/components/dashboard/posisi-stok/stock-position-detail-view"

export default function PosisiStokDetailPage() {
  const params = useParams()
  const itemId = params.itemId as string

  return <StockPositionDetailView itemId={itemId} />
}
