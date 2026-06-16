"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { UploadCloudIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { DraftTab } from "./draft-tab"
import { HasilTab } from "./hasil-tab"
import { ProductPickerDialog } from "./product-picker-dialog"

const TABS = [
  { id: "draft", label: "Draft" },
  { id: "hasil", label: "Hasil" },
] as const

export function UploadMassalView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pickerOpen, setPickerOpen] = React.useState(false)

  const urlTab = searchParams.get("tab")
  const active = TABS.some((t) => t.id === urlTab) ? (urlTab as string) : "hasil"

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <LiquidGlass
      radius={24}
      intensity="default"
      className="bg-white/40 dark:bg-white/[0.06]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-base font-medium">Produk</h2>
        <Button
          variant="primary"
          size="sm"
          className="h-9 gap-2"
          onClick={() => setPickerOpen(true)}
        >
          <UploadCloudIcon className="size-4" />
          Upload Baru
        </Button>
      </div>

      <Tabs value={active} onValueChange={setTab}>
        <div className="overflow-x-auto border-b border-border/60 px-3 pt-3 sm:px-4">
          <TabsList variant="line" className="h-auto pb-2">
            {TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <TabsContent value="draft">
            <DraftTab />
          </TabsContent>
          <TabsContent value="hasil">
            <HasilTab />
          </TabsContent>
        </div>
      </Tabs>

      <ProductPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} />
    </LiquidGlass>
  )
}
