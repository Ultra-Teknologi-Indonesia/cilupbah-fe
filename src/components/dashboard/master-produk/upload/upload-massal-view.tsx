"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { UploadCloudIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const initialTab = TABS.some((t) => t.id === urlTab) ? (urlTab as string) : "hasil"
  const [active, setActive] = React.useState(initialTab)

  const setTab = (next: string) => {
    setActive(next)
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
    <Button
      variant="primary"
      size="sm"
      className="h-9 gap-2"
      onClick={() => setPickerOpen(true)}
    >
      <UploadCloudIcon className="size-4" />
      Upload Baru
    </Button>
  )

  return (
    <>
      {active === "draft" ? (
        <DraftTab tabBar={tabBar} actionButton={actionButton} />
      ) : (
        <HasilTab tabBar={tabBar} actionButton={actionButton} />
      )}
      <ProductPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} />
    </>
  )
}
