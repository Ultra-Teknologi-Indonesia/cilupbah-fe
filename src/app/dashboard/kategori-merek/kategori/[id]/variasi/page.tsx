"use client"

import { use } from "react"
import { AtributVariasiView } from "@/components/dashboard/kategori-merek/atribut-variasi-view"

export default function VariasiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div className="flex flex-col gap-6">
      <AtributVariasiView categoryId={Number(id)} type="sales" />
    </div>
  )
}
