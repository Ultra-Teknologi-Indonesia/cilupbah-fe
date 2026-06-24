"use client"

import { useState, useCallback, Suspense } from "react"
import { Construction } from "lucide-react"

import { cn } from "@/lib/utils"
import { PageTitle } from "@/components/dashboard/page-title"
import { TableSkeleton } from "@/components/ui/page-skeleton"
import { PesananListView } from "@/components/dashboard/transaksi-pembelian/pesanan-list-view"
import { TagihanListView } from "@/components/dashboard/transaksi-pembelian/tagihan-list-view"

type PurchaseTab = "pesanan" | "tagihan" | "retur"

const TABS: { key: PurchaseTab; label: string }[] = [
  { key: "pesanan", label: "Pesanan" },
  { key: "tagihan", label: "Tagihan" },
  { key: "retur", label: "Retur" },
]

export default function TransaksiPembelianPage() {
  const [tab, setTab] = useState<PurchaseTab>("pesanan")

  const handleTabChange = useCallback((t: PurchaseTab) => {
    setTab(t)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Transaksi Pembelian"
        description="Kelola pesanan pembelian, tagihan, dan retur dari pemasok."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pembelian" },
          { label: "Transaksi Pembelian" },
        ]}
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {TABS.map(({ key, label }) => {
            const isActive = tab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleTabChange(key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {label}
              </button>
            )
          })}
        </div>

        {tab === "pesanan" && (
          <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
            <PesananListView />
          </Suspense>
        )}

        {tab === "tagihan" && (
          <Suspense fallback={<TableSkeleton rows={6} cols={8} />}>
            <TagihanListView />
          </Suspense>
        )}

        {tab === "retur" && (
          <div className="flex flex-col items-center justify-center gap-4 py-32 text-muted-foreground">
            <Construction className="h-12 w-12" />
            <div className="text-center">
              <p className="text-lg font-medium">Retur Pembelian</p>
              <p className="mt-1 text-sm">Fitur ini sedang dalam pengembangan.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
