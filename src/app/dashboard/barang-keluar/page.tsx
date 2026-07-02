"use client"

import { Suspense } from "react"

import { cn } from "@/lib/utils"
import { PageTitle } from "@/components/dashboard/page-title"
import { TableSkeleton } from "@/components/ui/page-skeleton"
import { ReturPembelianTab } from "@/components/dashboard/barang-keluar/retur-pembelian-tab"
import { TransferKeluarTab } from "@/components/dashboard/barang-keluar/transfer-keluar-tab"
import { useUrlTab } from "@/hooks/use-url-tab"

type OutboundTab = "retur" | "transfer"

const TABS: { key: OutboundTab; label: string }[] = [
  { key: "retur", label: "Retur Pembelian" },
  { key: "transfer", label: "Transfer Keluar" },
]

const TAB_KEYS = TABS.map((t) => t.key)

export default function BarangKeluarPage() {
  // Tab hidup di URL (?tab=) — bertahan saat refresh/back, bisa dibagikan.
  const [tab, handleTabChange] = useUrlTab<OutboundTab>("tab", "retur", {
    validValues: TAB_KEYS,
  })

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Barang Keluar"
        description="Kelola pengeluaran barang untuk retur pembelian dan transfer antar lokasi."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Barang Keluar" },
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

        {tab === "retur" && (
          <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
            <ReturPembelianTab />
          </Suspense>
        )}

        {tab === "transfer" && (
          <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
            <TransferKeluarTab />
          </Suspense>
        )}
      </div>
    </div>
  )
}
