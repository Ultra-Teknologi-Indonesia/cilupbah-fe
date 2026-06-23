"use client"

import { useCallback, useMemo, useState } from "react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  usePackingCounts,
  usePickingCounts,
  useShippingCounts,
} from "@/hooks/proses-pesanan/use-fulfillment"
import {
  STAGE_CONFIG,
  defaultSubFor,
  stageConfig,
  type FulfillmentStage,
} from "@/types/proses-pesanan/fulfillment"

import { StageTabs } from "./stage-tabs"
import { SubStatusPills } from "./sub-status-pills"
import { FulfillmentOrdersTable, ORDER_ACTION_PRESET } from "./shared/fulfillment-orders-table"
import { PicklistTable } from "./picking/picklist-table"
import { PacklistTable } from "./packing/packlist-table"
import { ShipmentTable } from "./shipping/shipment-table"

function ComingSoon({ label }: { label: string }) {
  return (
    <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
      <div className="px-4 py-16 text-center text-sm text-muted-foreground sm:px-5">
        Tahap <span className="font-medium text-foreground">{label}</span> — akan tersedia pada
        fase berikutnya.
      </div>
    </LiquidGlass>
  )
}

export function ProsesPesananView() {
  const [stage, setStage] = useState<FulfillmentStage>("picking")
  const [sub, setSub] = useState<string | null>(defaultSubFor("picking"))

  const subs = useMemo(() => stageConfig(stage)?.subs ?? [], [stage])
  const pickingCounts = usePickingCounts()
  const packingCounts = usePackingCounts()
  const shippingCounts = useShippingCounts()

  const handleStageChange = useCallback((s: FulfillmentStage) => {
    setStage(s)
    setSub(defaultSubFor(s))
  }, [])

  const countsMap =
    stage === "picking"
      ? pickingCounts
      : stage === "packing"
        ? packingCounts
        : stage === "shipping"
          ? shippingCounts
          : undefined

  const stageLabel = STAGE_CONFIG.find((s) => s.key === stage)?.label ?? ""
  const subLabel = subs.find((s) => s.key === sub)?.label

  function renderContent() {
    if (stage === "picking") {
      if (sub === "belum")
        return <FulfillmentOrdersTable stage="ready-to-process" actions={ORDER_ACTION_PRESET.pickingBelum} />
      if (sub === "diproses") return <PicklistTable />
      return <FulfillmentOrdersTable stage="finish-pick" actions={ORDER_ACTION_PRESET.docSet} />
    }
    if (stage === "packing") {
      if (sub === "belum")
        return <FulfillmentOrdersTable stage="finish-pick" actions={ORDER_ACTION_PRESET.docSet} />
      if (sub === "diproses") return <PacklistTable />
      return <FulfillmentOrdersTable stage="finish-pack" actions={ORDER_ACTION_PRESET.docSet} />
    }
    if (stage === "shipping") {
      if (sub === "jadwal") return <ShipmentTable />
      return <FulfillmentOrdersTable stage="finish-pack" actions={ORDER_ACTION_PRESET.shippingSiapKirim} />
    }
    return <ComingSoon label={`${stageLabel}${subLabel ? ` · ${subLabel}` : ""}`} />
  }

  return (
    <div className="flex flex-col gap-4">
      <StageTabs active={stage} onChange={handleStageChange} />

      {subs.length > 0 && (
        <SubStatusPills subs={subs} active={sub} onChange={setSub} counts={countsMap} />
      )}

      <div key={`${stage}-${sub}`}>{renderContent()}</div>
    </div>
  )
}
