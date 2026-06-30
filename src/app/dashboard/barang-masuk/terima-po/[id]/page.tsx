"use client"

import { useParams } from "next/navigation"
import { TerimaPOView } from "@/components/dashboard/barang-masuk/terima-po-view"

export default function TerimaPOPage() {
  const params = useParams()
  const id = params.id as string

  return <TerimaPOView id={id} />
}
