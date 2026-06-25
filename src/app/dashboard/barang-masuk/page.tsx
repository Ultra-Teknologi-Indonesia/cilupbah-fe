"use client"

import { useState, useCallback, Suspense } from "react"

import { cn } from "@/lib/utils"
import { PageTitle } from "@/components/dashboard/page-title"
import { TableSkeleton } from "@/components/ui/page-skeleton"
import { PesananPembelianTab } from "@/components/dashboard/barang-masuk/pesanan-pembelian-tab"
import { TransferMasukTab } from "@/components/dashboard/barang-masuk/transfer-masuk-tab"
import { ReturChannelTab } from "@/components/dashboard/barang-masuk/retur-channel-tab"
import { PenerimaanBarangTab } from "@/components/dashboard/barang-masuk/penerimaan-barang-tab"
import { PenempatanBarangTab } from "@/components/dashboard/barang-masuk/penempatan-barang-tab"

type InboundTab = "pesanan" | "transfer" | "retur" | "penerimaan" | "penempatan"

const TABS: { key: InboundTab; label: string }[] = [
  { key: "pesanan", label: "Pesanan Pembelian" },
  { key: "transfer", label: "Transfer Masuk" },
  { key: "retur", label: "Retur dari Channel Online" },
  { key: "penerimaan", label: "Penerimaan Barang" },
  { key: "penempatan", label: "Penempatan Barang" },
]

export default function BarangMasukPage() {
  const [tab, setTab] = useState<InboundTab>("pesanan")

  const handleTabChange = useCallback((t: InboundTab) => {
    setTab(t)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Barang Masuk"
        description="Kelola penerimaan barang dari pembelian, transfer, dan retur channel."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Barang Masuk" },
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
            <PesananPembelianTab />
          </Suspense>
        )}

        {tab === "transfer" && (
          <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
            <TransferMasukTab />
          </Suspense>
        )}

        {tab === "retur" && (
          <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
            <ReturChannelTab />
          </Suspense>
        )}

        {tab === "penerimaan" && (
          <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
            <PenerimaanBarangTab />
          </Suspense>
        )}

        {tab === "penempatan" && (
          <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
            <PenempatanBarangTab />
          </Suspense>
        )}
      </div>
    </div>
  )
}
