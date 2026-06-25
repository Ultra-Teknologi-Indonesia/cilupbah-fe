"use client"

import { useState } from "react"
import {
  SlidersHorizontalIcon,
  ClipboardCheckIcon,
  ArrowLeftRightIcon,
  ShieldIcon,
  DollarSignIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { PageTitle } from "@/components/dashboard/page-title"
import { PenyesuaianTab } from "@/components/dashboard/transaksi-stok/penyesuaian-tab"
import { OpnameTab } from "@/components/dashboard/transaksi-stok/opname-tab"
import { TransferTab } from "@/components/dashboard/transaksi-stok/transfer-tab"
import { CadangTab } from "@/components/dashboard/transaksi-stok/cadang-tab"
import { RevaluasiTab } from "@/components/dashboard/transaksi-stok/revaluasi-tab"

type Tab = "penyesuaian" | "opname" | "transfer" | "cadang" | "revaluasi"

const TABS: { key: Tab; label: string; icon: typeof SlidersHorizontalIcon }[] = [
  { key: "penyesuaian", label: "Penyesuaian Stok", icon: SlidersHorizontalIcon },
  { key: "opname", label: "Opname", icon: ClipboardCheckIcon },
  { key: "transfer", label: "Internal Transfer", icon: ArrowLeftRightIcon },
  { key: "cadang", label: "Cadang", icon: ShieldIcon },
  { key: "revaluasi", label: "Revaluasi", icon: DollarSignIcon },
]

export default function TransaksiStokPage() {
  const [activeTab, setActiveTab] = useState<Tab>("penyesuaian")

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Transaksi Stok"
        breadcrumb={[
          { label: "Persediaan" },
          { label: "Transaksi Stok" },
        ]}
      />

      <div className="flex items-center gap-1">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}
      </div>

      {activeTab === "penyesuaian" && <PenyesuaianTab />}
      {activeTab === "opname" && <OpnameTab />}
      {activeTab === "transfer" && <TransferTab />}
      {activeTab === "cadang" && <CadangTab />}
      {activeTab === "revaluasi" && <RevaluasiTab />}
    </div>
  )
}
