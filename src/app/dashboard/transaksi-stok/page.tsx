"use client"

import { Suspense } from "react"
import {
  SlidersHorizontalIcon,
  ClipboardCheckIcon,
  ArrowLeftRightIcon,
  ShieldIcon,
  DollarSignIcon,
} from "lucide-react"

import { PageTitle } from "@/components/dashboard/page-title"
import { PillTabs, type PillTabItem } from "@/components/dashboard/shared/pill-tabs"
import { TableSkeleton } from "@/components/ui/page-skeleton"
import { useUrlTab } from "@/hooks/use-url-tab"
import { PenyesuaianTab } from "@/components/dashboard/transaksi-stok/penyesuaian-tab"
import { OpnameTab } from "@/components/dashboard/transaksi-stok/opname-tab"
import { TransferTab } from "@/components/dashboard/transaksi-stok/transfer-tab"
import { CadangTab } from "@/components/dashboard/transaksi-stok/cadang-tab"
import { RevaluasiTab } from "@/components/dashboard/transaksi-stok/revaluasi-tab"

type Tab = "penyesuaian" | "opname" | "transfer" | "cadang" | "revaluasi"

const TABS: PillTabItem<Tab>[] = [
  { key: "penyesuaian", label: "Penyesuaian Stok", icon: SlidersHorizontalIcon },
  { key: "opname", label: "Opname", icon: ClipboardCheckIcon },
  { key: "transfer", label: "Internal Transfer", icon: ArrowLeftRightIcon },
  { key: "cadang", label: "Cadang", icon: ShieldIcon },
  { key: "revaluasi", label: "Revaluasi", icon: DollarSignIcon },
]

const TAB_KEYS = TABS.map((t) => t.key)

function TransaksiStokTabs() {
  // Tab hidup di URL (?tab=) — bertahan saat refresh/back.
  const [activeTab, setActiveTab] = useUrlTab<Tab>("tab", "penyesuaian", {
    validValues: TAB_KEYS,
  })

  return (
    <>
      <PillTabs items={TABS} active={activeTab} onSelect={setActiveTab} className="gap-1" />

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
