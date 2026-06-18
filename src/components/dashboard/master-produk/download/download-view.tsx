"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronDownIcon, CloudDownloadIcon, LayersIcon, PackageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProgressTab } from "./progress-tab"
import { HasilTab } from "./hasil-tab"
import { DownloadMassalDialog } from "./download-massal-dialog"
import { DownloadSatuanDialog } from "./download-satuan-dialog"

const TABS = [
  { id: "progress", label: "Progress" },
  { id: "hasil", label: "Hasil" },
] as const

export function DownloadView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlTab = searchParams.get("tab")
  const active = TABS.some((t) => t.id === urlTab) ? (urlTab as string) : "progress"

  const [massalOpen, setMassalOpen] = React.useState(false)
  const [satuanOpen, setSatuanOpen] = React.useState(false)

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const tabBar = (
    <Tabs value={active} onValueChange={setTab}>
      <TabsList variant="line">
        {TABS.map((t) => (
          <TabsTrigger key={t.id} value={t.id}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )

  const actionButton = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="primary" size="sm" className="h-9 gap-2">
          <CloudDownloadIcon className="size-4" />
          Tambah Baru
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onSelect={() => setSatuanOpen(true)} className="flex-col items-start gap-0.5">
          <span className="flex items-center gap-2 font-medium">
            <PackageIcon className="size-4" />
            Download Satuan
          </span>
          <span className="pl-6 text-xs text-muted-foreground">
            Cari & unduh produk satu per satu.
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setMassalOpen(true)} className="flex-col items-start gap-0.5">
          <span className="flex items-center gap-2 font-medium">
            <LayersIcon className="size-4" />
            Download Massal
          </span>
          <span className="pl-6 text-xs text-muted-foreground">
            Tarik seluruh produk dari toko.
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {active === "hasil" ? (
        <HasilTab tabBar={tabBar} actionButton={actionButton} />
      ) : (
        <ProgressTab tabBar={tabBar} actionButton={actionButton} />
      )}

      <DownloadMassalDialog
        open={massalOpen}
        onOpenChange={setMassalOpen}
        onQueued={() => setTab("progress")}
      />
      <DownloadSatuanDialog open={satuanOpen} onOpenChange={setSatuanOpen} />
    </>
  )
}
