"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { STAGE_CONFIG, type FulfillmentStage } from "@/types/proses-pesanan/fulfillment"

function activeStage(pathname: string): FulfillmentStage {
  for (const { key } of STAGE_CONFIG) {
    if (pathname.includes(`/proses-pesanan/${key}`)) return key
  }
  return "picking"
}

export function StageTabs() {
  const pathname = usePathname()
  const active = activeStage(pathname)

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
          {STAGE_CONFIG.map(({ key, label }) => (
            <TabsTrigger
              key={key}
              value={key}
              asChild
              className="text-muted-foreground data-active:bg-background data-active:font-medium data-active:text-primary data-active:shadow-sm"
            >
              <Link href={`/dashboard/proses-pesanan/${key}`}>{label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </LiquidGlass>
  )
}
