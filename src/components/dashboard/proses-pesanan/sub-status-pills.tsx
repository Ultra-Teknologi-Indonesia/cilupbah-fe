"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { StageSub } from "@/types/proses-pesanan/fulfillment"

export function SubStatusTabs({
  subs,
  active,
  onChange,
  counts,
}: {
  subs: StageSub[]
  active: string | null
  onChange: (sub: string) => void
  counts?: Record<string, number | undefined>
}) {
  if (!subs.length) return null

  return (
    <Tabs value={active ?? undefined} onValueChange={onChange}>
      <TabsList variant="line">
        {subs.map(({ key, label }) => {
          const count = counts?.[key]
          return (
            <TabsTrigger key={key} value={key}>
              {label}
              {count != null && (
                <span className="ml-1 rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
                  {count}
                </span>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
