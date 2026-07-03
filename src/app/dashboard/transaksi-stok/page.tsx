"use client"

import { Suspense } from "react"
import {
  SlidersHorizontalIcon,
  ClipboardCheckIcon,
  ArrowLeftRightIcon,
  ShieldIcon,
  DollarSignIcon,
} from "lucide-react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageTitle } from "@/components/dashboard/page-title"
import { TableSkeleton } from "@/components/ui/page-skeleton"
import { useUrlTab } from "@/hooks/use-url-tab"
import { PenyesuaianTab } from "@/components/dashboard/transaksi-stok/penyesuaian-tab"
import { OpnameTab } from "@/components/dashboard/transaksi-stok/opname-tab"
import { TransferTab } from "@/components/dashboard/transaksi-stok/transfer-tab"
import { CadangTab } from "@/components/dashboard/transaksi-stok/cadang-tab"
import { RevaluasiTab } from "@/components/dashboard/transaksi-stok/revaluasi-tab"

type Tab = "penyesuaian" | "opname" | "transfer" | "cadang" | "revaluasi"

const TABS: { key: Tab; label: string; icon: typeof SlidersHorizontalIcon }[] = [
  { key: "penyesuaian", label: "Koreksi Stok", icon: SlidersHorizontalIcon },
  { key: "opname", label: "Stok Opname", icon: ClipboardCheckIcon },
  { key: "transfer", label: "Internal Transfer", icon: ArrowLeftRightIcon },
  { key: "cadang", label: "Reservasi Stok", icon: ShieldIcon },
  { key: "revaluasi", label: "Ubah Nilai Stok", icon: DollarSignIcon },
]

const TAB_KEYS = TABS.map((t) => t.key)

function TransaksiStokTabs() {
  // Tab hidup di URL (?tab=) — bertahan saat refresh/back.
  const [activeTab, setActiveTab] = useUrlTab<Tab>("tab", "penyesuaian", {
    validValues: TAB_KEYS,
  })

  return (
    <>
      <LiquidGlass
        radius={16}
        intensity="subtle"
        showGlow={false}
        showShadow={false}
        reactive={false}
        className="w-fit max-w-full overflow-x-auto bg-white/50 p-1.5 dark:bg-white/[0.06]"
      >
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
          <TabsList className="gap-1 bg-transparent">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="text-muted-foreground data-active:bg-background data-active:font-medium data-active:text-primary data-active:shadow-sm"
                >
                  <Icon />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </LiquidGlass>

      {activeTab === "penyesuaian" && <PenyesuaianTab />}
      {activeTab === "opname" && <OpnameTab />}
      {activeTab === "transfer" && <TransferTab />}
      {activeTab === "cadang" && <CadangTab />}
      {activeTab === "revaluasi" && <RevaluasiTab />}
    </>
  )
}

export default function TransaksiStokPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Transaksi Stok"
        breadcrumb={[
          { label: "Persediaan" },
          { label: "Transaksi Stok" },
        ]}
      />

      {/* Suspense wajib untuk useSearchParams (useUrlTab) saat prerender. */}
      <Suspense fallback={<TableSkeleton rows={6} cols={5} />}>
        <TransaksiStokTabs />
      </Suspense>
    </div>
  )
}
