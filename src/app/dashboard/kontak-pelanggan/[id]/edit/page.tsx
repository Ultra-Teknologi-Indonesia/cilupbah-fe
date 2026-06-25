"use client"

import { use } from "react"
import { PelangganFormPage } from "@/components/dashboard/kontak-pelanggan/pelanggan-form-page"

export default function EditPelangganPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <PelangganFormPage mode="edit" id={id} />
}
