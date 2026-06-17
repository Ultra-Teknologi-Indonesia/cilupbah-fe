"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  ActivityIcon,
  ArchiveIcon,
  ClockIcon,
  CloudDownloadIcon,
  Package2Icon,
  PlugIcon,
  TrendingUpIcon,
  UploadCloudIcon,
} from "lucide-react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Tab = {
  id: string
  label: string
  icon: typeof ActivityIcon
  href?: string
}

// Tahap "Alur Pengelolaan Produk" (selaras Jubelio). Tab tanpa href = belum
// dibangun → tampil disabled "Segera".
const TABS: Tab[] = [
  { id: "pantauan", label: "Pantauan", icon: ActivityIcon },
  { id: "master", label: "Master", icon: Package2Icon, href: "/dashboard/master-produk" },
  { id: "upload", label: "Upload", icon: UploadCloudIcon, href: "/dashboard/produk/upload" },
  { id: "download", label: "Download", icon: CloudDownloadIcon },
  { id: "in_review", label: "In Review", icon: ClockIcon, href: "/dashboard/master-produk?status=in_review" },
  { id: "arsip", label: "Arsip", icon: ArchiveIcon, href: "/dashboard/master-produk/arsip" },
  { id: "channel", label: "Produk Channel", icon: PlugIcon, href: "/dashboard/listing-marketplace" },
  { id: "naikkan", label: "Naikkan Produk", icon: TrendingUpIcon },
]

function activeId(pathname: string, status: string | null): string {
  if (pathname.startsWith("/dashboard/master-produk/arsip")) return "arsip"
  if (pathname === "/dashboard/master-produk") return status === "in_review" ? "in_review" : "master"
  if (pathname.startsWith("/dashboard/produk/upload")) return "upload"
  if (pathname.startsWith("/dashboard/listing-marketplace")) return "channel"
  return ""
}

export function ProdukTabBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = activeId(pathname, searchParams.get("status"))

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
