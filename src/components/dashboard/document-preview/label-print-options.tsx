"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Opsi cetak per channel — hanya yang didukung API masing-masing.
const TIKTOK_TYPES = [
  { value: "SHIPPING_LABEL", label: "Label" },
  { value: "PACKING_LIST", label: "Slip" },
  { value: "SHIPPING_LABEL_AND_PACKING_LIST", label: "Label + Slip" },
]
const TIKTOK_SIZES = [
  { value: "A6", label: "A6 / Thermal" },
  { value: "A5", label: "A5" },
  { value: "A4", label: "A4" },
]
const SHOPEE_TYPES = [
  { value: "NORMAL_AIR_WAYBILL", label: "AWB Normal" },
  { value: "THERMAL_AIR_WAYBILL", label: "AWB Thermal" },
]

function OptSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  ariaLabel: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className="h-8 w-auto min-w-28" aria-label={ariaLabel}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * Selector opsi cetak label pengiriman, tampil sesuai channel order (dari meta.source).
 * Mengubah opsi memperbarui query param preview → memicu re-fetch PDF dengan opsi baru.
 */
export function LabelPrintOptions({ source }: { source?: string | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const setParam = (key: string, val: string) => {
    const next = new URLSearchParams(sp.toString())
    if (val) next.set(key, val)
    else next.delete(key)
    router.replace(`${pathname}?${next.toString()}`)
  }

  const channel = (source ?? "").toLowerCase()

  if (channel === "tiktok") {
    return (
      <div className="hidden items-center gap-1.5 md:flex">
        <OptSelect
          ariaLabel="Jenis dokumen"
          value={sp.get("document_type") ?? "SHIPPING_LABEL"}
          onChange={(v) => setParam("document_type", v)}
          options={TIKTOK_TYPES}
        />
        <OptSelect
          ariaLabel="Ukuran kertas"
          value={sp.get("document_size") ?? "A6"}
          onChange={(v) => setParam("document_size", v)}
          options={TIKTOK_SIZES}
        />
      </div>
    )
  }

  if (channel === "shopee") {
    return (
      <div className="hidden items-center gap-1.5 md:flex">
        <OptSelect
          ariaLabel="Format AWB"
          value={sp.get("document_type") ?? "NORMAL_AIR_WAYBILL"}
          onChange={(v) => setParam("document_type", v)}
          options={SHOPEE_TYPES}
        />
      </div>
    )
  }

  return null
}
