"use client"

import { useCallback, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { PackageIcon, PlusIcon, ScanBarcodeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { PicklistTable } from "./picking/picklist-table"
import { ReadyToProcessCardList } from "./picking/ready-to-process-card-list"
import { PacklistTable } from "./packing/packlist-table"
import { ShipmentTable } from "./shipping/shipment-table"
import { TambahPengirimanDialog } from "./shipping/tambah-pengiriman-dialog"
import { FulfillmentCardList } from "./shared/completed-order-card-list"

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="px-4 py-16 text-center text-sm text-muted-foreground sm:px-5">
      Tahap <span className="font-medium text-foreground">{label}</span> — akan tersedia pada
      fase berikutnya.
    </div>
  )
}

export function ProsesPesananView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const stage = useMemo<FulfillmentStage>(() => {
    const s = searchParams.get("stage")
    return STAGE_CONFIG.some((c) => c.key === s) ? (s as FulfillmentStage) : "picking"
  }, [searchParams])

  const sub = useMemo<string | null>(() => {
    const cfg = stageConfig(stage)
    const subs = cfg?.subs ?? []
    const s = searchParams.get("sub")
    if (s && subs.some((c) => c.key === s)) return s
    return defaultSubFor(stage)
  }, [searchParams, stage])

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v === null) params.delete(k)
        else params.set(k, v)
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const subs = useMemo(() => stageConfig(stage)?.subs ?? [], [stage])
  const pickingCounts = usePickingCounts()
  const packingCounts = usePackingCounts()
  const shippingCounts = useShippingCounts()

  const handleStageChange = useCallback(
    (s: FulfillmentStage) => {
      const defaultSub = defaultSubFor(s)
      updateParams({ stage: s, sub: defaultSub })
    },
    [updateParams]
  )

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
      if (sub === "belum") return <ReadyToProcessCardList />
      if (sub === "diproses") return <PicklistTable />
      return <FulfillmentCardList stage="finish-pick" tab="all" emptyTitle="Belum ada pesanan selesai pick" emptyDescription="Pesanan yang sudah selesai dipick akan muncul di sini." />
    }
    if (stage === "packing") {
      if (sub === "belum")
        return <FulfillmentCardList stage="finish-pick" tab="all" emptyTitle="Belum ada pesanan siap packing" emptyDescription="Pesanan yang sudah selesai dipick akan muncul di sini." />
      if (sub === "diproses") return <PacklistTable />
      return <FulfillmentCardList stage="finish-pack" tab="all" emptyTitle="Belum ada pesanan selesai packing" emptyDescription="Pesanan yang sudah selesai dipacking akan muncul di sini." />
    }
    if (stage === "shipping") {
      if (sub === "jadwal") return <ShipmentTable />
      return <FulfillmentCardList stage="finish-pack" tab="all" emptyTitle="Belum ada pesanan siap kirim" emptyDescription="Pesanan yang sudah dipacking akan muncul di sini." />
    }
    if (stage === "delivered")
      return <FulfillmentCardList stage="ready-to-ship" tab="in-transit" emptyTitle="Belum ada pesanan dikirim" emptyDescription="Pesanan yang sudah dikirim akan muncul di sini." />
    if (stage === "done")
      return <FulfillmentCardList stage="shipped" tab="completed" emptyTitle="Belum ada pesanan selesai" emptyDescription="Pesanan yang sudah terkirim akan muncul di sini." />
    return <ComingSoon label={`${stageLabel}${subLabel ? ` · ${subLabel}` : ""}`} />
  }

  const [showTambahPengiriman, setShowTambahPengiriman] = useState(false)

  const showAdHocPickingButton = stage === "picking" && sub === "diproses"
  const showPackingButton = stage === "packing" && sub === "belum"
  const showTambahPengirimanButton = stage === "shipping" && sub === "siap-kirim"

  return (
    <div className="flex flex-col gap-4">
      <StageTabs active={stage} onChange={handleStageChange} />

      <LiquidGlass
        radius={24}
        intensity="default"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h2 className="text-base font-medium">{stageLabel}</h2>
            {subs.length > 0 && (
              <div className="mt-3">
                <SubStatusPills
                  subs={subs}
                  active={sub}
                  onChange={(s) => updateParams({ sub: s })}
                  counts={countsMap}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showAdHocPickingButton && (
              <Button asChild variant="primary" size="sm" className="h-9">
                <Link href="/dashboard/proses-pesanan/picking/proses-pesanan">
                  <ScanBarcodeIcon className="size-4" /> Proses Picking
                </Link>
              </Button>
            )}
            {showPackingButton && (
              <Button asChild variant="primary" size="sm" className="h-9">
                <Link href="/dashboard/proses-pesanan/packing/proses-packing">
                  <PackageIcon className="size-4" /> Mulai Packing
                </Link>
              </Button>
            )}
            {showTambahPengirimanButton && (
              <Button
                variant="primary"
                size="sm"
                className="h-9"
                onClick={() => setShowTambahPengiriman(true)}
              >
                <PlusIcon className="size-4" /> Tambah Pengiriman Baru
              </Button>
            )}
          </div>
        </div>

        <div key={`${stage}-${sub}`}>{renderContent()}</div>
      </LiquidGlass>

      <TambahPengirimanDialog
        open={showTambahPengiriman}
        onOpenChange={setShowTambahPengiriman}
      />
    </div>
  )
}
