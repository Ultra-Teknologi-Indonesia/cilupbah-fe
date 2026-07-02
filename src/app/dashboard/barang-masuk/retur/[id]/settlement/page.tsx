"use client"

import { use } from "react"
import { ReturnSettlementView } from "@/components/dashboard/barang-masuk/return-settlement-view"

export default function ReturnSettlementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <ReturnSettlementView returnId={id} />
}
