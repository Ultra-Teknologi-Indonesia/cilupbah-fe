"use client"

import { use } from "react"
import { InvoiceView } from "@/components/dashboard/pesanan/invoice-view"

export default function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <InvoiceView orderId={id} />
}
