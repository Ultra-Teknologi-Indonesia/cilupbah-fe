"use client"

import {
  XIcon,
  PlayIcon,
  WarehouseIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  FileTextIcon,
  TruckIcon,
  BanIcon,
  PrinterIcon,
  CheckIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { OrderTab, SubFilter } from "@/types/pesanan/order"

export function BulkActionBar({
  tab,
  subFilter,
  count,
  onClear,
}: {
  tab: OrderTab
  subFilter: SubFilter
  count: number
  onClear: () => void
}) {
  if (count === 0) return null

  const label = `${count} pesanan dipilih`

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-2.5 shadow-xl shadow-black/10 dark:shadow-black/30">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground"
          onClick={onClear}
        >
          <XIcon className="h-3.5 w-3.5" />
          Batal
        </Button>

        <span className="text-sm font-medium tabular-nums">{label}</span>

        <Separator orientation="vertical" className="!h-5" />

        <TabBulkActions tab={tab} subFilter={subFilter} count={count} />
      </div>
    </div>
  )
}

function TabBulkActions({ tab, subFilter, count }: { tab: OrderTab; subFilter: SubFilter; count: number }) {
  const placeholder = (label: string) => () => toast.info(`${label} untuk ${count} pesanan akan segera tersedia`)

  if (tab === "ready-to-process") {
    return (
      <>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Proses Pesanan")}>
          <PlayIcon className="h-3.5 w-3.5" />
          Proses Pesanan
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Edit Gudang")}>
          <WarehouseIcon className="h-3.5 w-3.5" />
          Edit Gudang
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Selesaikan")}>
          <CheckCircleIcon className="h-3.5 w-3.5" />
          Selesaikan
        </Button>
      </>
    )
  }

  if (tab === "in-transit") {
    return (
      <>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Cetak Resi")}>
          <PrinterIcon className="h-3.5 w-3.5" />
          Cetak Resi
        </Button>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Selesaikan")}>
          <CheckCircleIcon className="h-3.5 w-3.5" />
          Selesaikan
        </Button>
      </>
    )
  }

  if (tab === "completed") {
    return (
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Cetak Faktur")}>
        <FileTextIcon className="h-3.5 w-3.5" />
        Cetak Faktur
      </Button>
    )
  }

  if (tab === "empty-stock" || tab === "failed-pick") {
    return (
      <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Pindahkan ke Perlu Dikirim")}>
        <ArrowRightIcon className="h-3.5 w-3.5" />
        Pindahkan ke Perlu Dikirim
      </Button>
    )
  }

  if (tab === "cancellation") {
    if (subFilter === "cancelled") return null
    return (
      <>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Terima Pembatalan")}>
          <CheckIcon className="h-3.5 w-3.5" />
          Terima Pembatalan
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Tolak Pembatalan")}>
          <XIcon className="h-3.5 w-3.5" />
          Tolak Pembatalan
        </Button>
      </>
    )
  }

  if (tab === "returned") {
    if (subFilter === "accepted" || subFilter === "rejected") {
      return (
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Cetak Faktur")}>
          <FileTextIcon className="h-3.5 w-3.5" />
          Cetak Faktur
        </Button>
      )
    }
    return (
      <>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Terima Retur")}>
          <CheckIcon className="h-3.5 w-3.5" />
          Terima Retur
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Tolak Retur")}>
          <XIcon className="h-3.5 w-3.5" />
          Tolak Retur
        </Button>
      </>
    )
  }

  if (tab === "all") {
    return (
      <>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Kirim")}>
          <TruckIcon className="h-3.5 w-3.5" />
          Kirim
        </Button>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10" onClick={placeholder("Batalkan")}>
          <BanIcon className="h-3.5 w-3.5" />
          Batalkan
        </Button>
      </>
    )
  }

  return null
}
