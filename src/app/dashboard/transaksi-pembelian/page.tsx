"use client"

import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { TableSkeleton } from "@/components/ui/page-skeleton"
import { PesananListView } from "@/components/dashboard/transaksi-pembelian/pesanan-list-view"

export default function TransaksiPembelianPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Transaksi Pembelian"
        description="Kelola pesanan pembelian dari pemasok."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pembelian" },
          { label: "Transaksi Pembelian" },
        ]}
      />

      <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
        <PesananListView />
      </Suspense>
    </div>
  )
}
