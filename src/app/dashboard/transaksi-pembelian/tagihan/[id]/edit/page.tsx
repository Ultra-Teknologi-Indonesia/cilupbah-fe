"use client"

import { use } from "react"
import { TagihanFormPage } from "@/components/dashboard/transaksi-pembelian/tagihan-form-page"

export default function EditTagihanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <TagihanFormPage mode="edit" id={id} />
}
