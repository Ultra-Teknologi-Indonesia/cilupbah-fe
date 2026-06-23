"use client"

import { useCallback, useMemo, useState } from "react"
import { RefreshCwIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  STAGE_CONFIG,
  defaultSubFor,
  stageConfig,
  type FulfillmentStage,
} from "@/types/proses-pesanan/fulfillment"

import { StageTabs } from "./stage-tabs"
import { SubStatusPills } from "./sub-status-pills"

export function ProsesPesananView() {
  const [stage, setStage] = useState<FulfillmentStage>("picking")
  const [sub, setSub] = useState<string | null>(defaultSubFor("picking"))

  const subs = useMemo(() => stageConfig(stage)?.subs ?? [], [stage])

  const handleStageChange = useCallback((s: FulfillmentStage) => {
    setStage(s)
    setSub(defaultSubFor(s))
  }, [])

  const stageLabel = STAGE_CONFIG.find((s) => s.key === stage)?.label ?? ""
  const subLabel = subs.find((s) => s.key === sub)?.label

  return (
    <div className="flex flex-col gap-4">
      <StageTabs active={stage} onChange={handleStageChange} />

      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <SubStatusPills subs={subs} active={sub} onChange={setSub} />

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <button
              type="button"
              className="rounded-full p-1.5 transition-colors hover:bg-muted"
              aria-label="Muat ulang"
            >
              <RefreshCwIcon className="size-4" />
            </button>
            <span className="flex items-center gap-1.5">
              Total <Badge>0</Badge>
            </span>
          </div>
        </div>

        <div className="px-4 pb-5 sm:px-5">
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            Tahap{" "}
            <span className="font-medium text-foreground">
              {stageLabel}
              {subLabel ? ` · ${subLabel}` : ""}
            </span>{" "}
            — tabel & aksi akan tersedia pada fase berikutnya.
          </div>
        </div>
      </LiquidGlass>
    </div>
  )
}
