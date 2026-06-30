"use client"

import { useParams } from "next/navigation"
import { PutawayProcessView } from "@/components/dashboard/barang-masuk/putaway-process-view"

export default function PutawayProcessPage() {
  const params = useParams()
  const id = params.id as string

  return <PutawayProcessView id={id} />
}
