"use client"

import { use } from "react"
import { KontakDetailView } from "@/components/dashboard/kontak-pemasok/kontak-detail-view"

export default function DetailKontakPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <KontakDetailView id={id} />
}
