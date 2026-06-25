"use client"

import { useState } from "react"
import { UsersIcon, BadgeCheckIcon, TagIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { PageTitle } from "@/components/dashboard/page-title"
import { PelangganTab } from "@/components/dashboard/kontak-pelanggan/pelanggan-tab"
import { SalesmanTab } from "@/components/dashboard/kontak-pelanggan/salesman-tab"
import { KategoriTab } from "@/components/dashboard/kontak-pelanggan/kategori-tab"

type Tab = "pelanggan" | "salesman" | "kategori"

const TABS: { key: Tab; label: string; icon: typeof UsersIcon }[] = [
  { key: "pelanggan", label: "Pelanggan", icon: UsersIcon },
  { key: "salesman", label: "Salesman", icon: BadgeCheckIcon },
  { key: "kategori", label: "Kategori", icon: TagIcon },
]

export default function KontakPelangganPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pelanggan")

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Kontak Pelanggan"
        breadcrumb={[
          { label: "Penjualan" },
          { label: "Kontak Pelanggan" },
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

      {activeTab === "pelanggan" && <PelangganTab />}
      {activeTab === "salesman" && <SalesmanTab />}
      {activeTab === "kategori" && <KategoriTab />}
    </div>
  )
}
