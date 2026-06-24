"use client"

import { use } from "react"
import { PesananFormPage } from "@/components/dashboard/transaksi-pembelian/pesanan-form-page"

export default function EditPesananPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <PesananFormPage mode="edit" id={id} />
}
