"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ShoppingCartIcon,
  ArrowRightLeftIcon,
  Undo2Icon,
  PackageIcon,
  LayersIcon,
} from "lucide-react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Tab = {
  id: string
  label: string
  icon: typeof ShoppingCartIcon
  href?: string
}

const TABS: Tab[] = [
  { id: "pesanan", label: "Pesanan Pembelian", icon: ShoppingCartIcon, href: "/dashboard/barang-masuk/pesanan" },
  { id: "transfer", label: "Transfer Masuk", icon: ArrowRightLeftIcon, href: "/dashboard/barang-masuk/transfer" },
  { id: "retur", label: "Retur dari Channel Online", icon: Undo2Icon, href: "/dashboard/barang-masuk/retur" },
  { id: "penerimaan", label: "Penerimaan Barang", icon: PackageIcon, href: "/dashboard/barang-masuk/penerimaan" },
  { id: "penempatan", label: "Penempatan Barang", icon: LayersIcon, href: "/dashboard/barang-masuk/penempatan" },
]

function activeId(pathname: string): string {
  if (pathname.startsWith("/dashboard/barang-masuk/transfer")) return "transfer"
  if (pathname.startsWith("/dashboard/barang-masuk/retur")) return "retur"
  // Needs strict check for penerimaan because it might have /penerimaan/[id] but we want it to be active
  if (pathname.startsWith("/dashboard/barang-masuk/penerimaan")) return "penerimaan"
  if (pathname.startsWith("/dashboard/barang-masuk/penempatan")) return "penempatan"
  if (pathname.startsWith("/dashboard/barang-masuk/pesanan")) return "pesanan"
  if (pathname.startsWith("/dashboard/barang-masuk/terima-po")) return "pesanan"
  // Default fallback
  return "pesanan"
}

export function BarangMasukTabBar() {
  const pathname = usePathname()
  const active = activeId(pathname)

  return (
    <LiquidGlass
      radius={16}
      intensity="subtle"
      showGlow={false}
      showShadow={false}
      reactive={false}
      className="w-fit max-w-full overflow-x-auto bg-white/50 p-1.5 dark:bg-white/[0.06]"
    >
      <Tabs value={active}>
        <TabsList className="gap-1 bg-transparent">
          {TABS.map((tab) => {
            const Icon = tab.icon

            if (!tab.href) {
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  disabled
                  title="Segera hadir"
                  className="text-muted-foreground/60"
                >
                  <Icon />
                  {tab.label}
                  <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Segera
                  </span>
                </TabsTrigger>
              )
            }

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                asChild
                className="text-muted-foreground data-active:bg-background data-active:font-medium data-active:text-primary data-active:shadow-sm"
              >
                <Link href={tab.href}>
                  <Icon />
                  {tab.label}
                </Link>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
    </LiquidGlass>
  )
}
