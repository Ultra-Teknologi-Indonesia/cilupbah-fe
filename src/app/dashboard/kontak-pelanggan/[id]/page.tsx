"use client"

import { use } from "react"
import { PelangganDetailView } from "@/components/dashboard/kontak-pelanggan/pelanggan-detail-view"

export default function PelangganDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <PelangganDetailView id={id} />
}
