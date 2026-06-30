"use client"

import { useParams } from "next/navigation"
import { PenerimaanDetailView } from "@/components/dashboard/barang-masuk/penerimaan-detail-view"

export default function PenerimaanDetailPage() {
  const params = useParams()
  const id = params.id as string

  return <PenerimaanDetailView id={id} />
}
