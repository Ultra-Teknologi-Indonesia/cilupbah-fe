"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  ActivityIcon,
  ArchiveIcon,
  CloudDownloadIcon,
  ImportIcon,
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
  { id: "pantauan", label: "Pantauan", icon: ActivityIcon, href: "/dashboard/produk/pantauan" },
  { id: "master", label: "Master", icon: Package2Icon, href: "/dashboard/produk" },
  { id: "upload", label: "Upload", icon: UploadCloudIcon, href: "/dashboard/produk/upload" },
  { id: "download", label: "Download", icon: CloudDownloadIcon, href: "/dashboard/produk/download" },
  { id: "import", label: "Import", icon: ImportIcon, href: "/dashboard/produk/import" },
  { id: "arsip", label: "Arsip", icon: ArchiveIcon, href: "/dashboard/produk/arsip" },
  { id: "channel", label: "Produk Channel", icon: PlugIcon, href: "/dashboard/produk/listing-marketplace" },
  { id: "naikkan", label: "Naikkan Produk", icon: TrendingUpIcon, href: "/dashboard/produk/naikkan" },
]

function activeId(pathname: string, status: string | null): string {
  if (pathname.startsWith("/dashboard/produk/arsip")) return "arsip"
  if (pathname.startsWith("/dashboard/produk/pantauan")) return "pantauan"
  if (pathname.startsWith("/dashboard/produk/upload")) return "upload"
  if (pathname.startsWith("/dashboard/produk/download")) return "download"
  if (pathname.startsWith("/dashboard/produk/import")) return "import"
  if (pathname.startsWith("/dashboard/produk/listing-marketplace")) return "channel"
  if (pathname.startsWith("/dashboard/produk/naikkan")) return "naikkan"
  if (pathname.startsWith("/dashboard/produk")) return "master"
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
