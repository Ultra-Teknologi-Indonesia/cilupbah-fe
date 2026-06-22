"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GlobeIcon, StoreIcon, BookOpenIcon, ZapIcon, AlertTriangleIcon, SlidersHorizontalIcon } from "lucide-react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Tab = {
  id: string
  label: string
  icon: typeof GlobeIcon
  href?: string
}

const TABS: Tab[] = [
  { id: "online", label: "Harga Online", icon: GlobeIcon, href: "/dashboard/harga/online" },
  { id: "offline", label: "Harga Offline", icon: StoreIcon, href: "/dashboard/harga/offline" },
  { id: "penyesuaian", label: "Penyesuaian", icon: SlidersHorizontalIcon, href: "/dashboard/harga/penyesuaian" },
  { id: "buku-harga", label: "Buku Harga", icon: BookOpenIcon },
  { id: "promosi", label: "Sedang Promo", icon: ZapIcon },
  { id: "gagal", label: "Gagal Sinkron", icon: AlertTriangleIcon },
]

function activeId(pathname: string): string {
  if (pathname.startsWith("/dashboard/harga/offline")) return "offline"
  if (pathname.startsWith("/dashboard/harga/online")) return "online"
  if (pathname.startsWith("/dashboard/harga/penyesuaian")) return "penyesuaian"
  if (pathname.startsWith("/dashboard/harga")) return "online"
  return ""
}

export function HargaTabBar() {
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
                <Link href={tab.href} prefetch={false}>
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
