"use client"

import { use } from "react"
import { KontakFormPage } from "@/components/dashboard/kontak-pemasok/kontak-form-page"

export default function EditKontakPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <KontakFormPage mode="edit" id={id} />
}
