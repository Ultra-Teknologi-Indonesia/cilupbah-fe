"use client"

import { useCallback, useMemo, useState } from "react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { usePickingCounts } from "@/hooks/proses-pesanan/use-fulfillment"
import {
  STAGE_CONFIG,
  defaultSubFor,
  stageConfig,
  type FulfillmentStage,
} from "@/types/proses-pesanan/fulfillment"

import { StageTabs } from "./stage-tabs"
import { SubStatusPills } from "./sub-status-pills"
import { PickingOrdersTable } from "./picking/picking-orders-table"
import { PicklistTable } from "./picking/picklist-table"

export function ProsesPesananView() {
  const [stage, setStage] = useState<FulfillmentStage>("picking")
  const [sub, setSub] = useState<string | null>(defaultSubFor("picking"))

  const subs = useMemo(() => stageConfig(stage)?.subs ?? [], [stage])
  const pickingCounts = usePickingCounts()

  const handleStageChange = useCallback((s: FulfillmentStage) => {
    setStage(s)
    setSub(defaultSubFor(s))
  }, [])

  const isPicking = stage === "picking"
  const countsMap = isPicking
    ? {
        belum: pickingCounts.belum,
        diproses: pickingCounts.diproses,
        selesai: pickingCounts.selesai,
      }
    : undefined

  const stageLabel = STAGE_CONFIG.find((s) => s.key === stage)?.label ?? ""
  const subLabel = subs.find((s) => s.key === sub)?.label

  return (
    <div className="flex flex-col gap-4">
      <StageTabs active={stage} onChange={handleStageChange} />

      {subs.length > 0 && (
        <SubStatusPills subs={subs} active={sub} onChange={setSub} counts={countsMap} />
      )}

      {isPicking ? (
        sub === "diproses" ? (
          <PicklistTable />
        ) : (
          <PickingOrdersTable sub={(sub as "belum" | "selesai") ?? "belum"} />
        )
      ) : (
        <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
          <div className="px-4 py-16 text-center text-sm text-muted-foreground sm:px-5">
            Tahap{" "}
            <span className="font-medium text-foreground">
              {stageLabel}
              {subLabel ? ` · ${subLabel}` : ""}
            </span>{" "}
            — akan tersedia pada fase berikutnya.
          </div>
        </LiquidGlass>
      )}
    </div>
  )
}
