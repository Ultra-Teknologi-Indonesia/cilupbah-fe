"use client"

import { use } from "react"
import { OrderDetailView } from "@/components/dashboard/pesanan/order-detail-view"

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <OrderDetailView orderId={id} />
}
