"use client"

import type React from "react"
import { useMemo } from "react"
import { format, parse } from "date-fns"
import type { DateRange } from "react-day-picker"

import { Combobox } from "@/components/ui/combobox"
import { DateRangePicker } from "@/components/ui/date-picker"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { cn } from "@/lib/utils"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
import { useCouriers } from "@/hooks/proses-pesanan/use-fulfillment"
import { CHANNEL_MAP } from "@/types/pesanan/order"

const CONTENT_OPTIONS = [
  { value: "", label: "Semua Isi" },
  { value: "combo", label: "SKU Kombinasi" },
  { value: "single_1qty", label: "1 SKU, 1 Qty" },
  { value: "single_nqty", label: "1 SKU, > 1 Qty" },
]

const CHANNEL_OPTIONS = [
  { value: "", label: "Semua Channel" },
  ...Object.entries(CHANNEL_MAP).map(([k, v]) => ({ value: k, label: v.label })),
]

const PAYMENT_OPTIONS = [
  { value: "cod", label: "COD" },
  { value: "noncod", label: "Non-COD" },
]

const LABEL_PRINTED_OPTIONS = [
  { value: "yes", label: "Sudah cetak" },
  { value: "no", label: "Belum cetak" },
]

export interface FilterState {
  channel: string
  store_id: string
  location_id: string
  content_type: string
  date_from: string
  date_to: string
  shipping_provider: string
  payment: string
  label_printed: string
}

const EMPTY: FilterState = {
  channel: "",
  store_id: "",
  location_id: "",
  content_type: "",
  date_from: "",
  date_to: "",
  shipping_provider: "",
  payment: "",
  label_printed: "",
}

function toDate(s: string): Date | undefined {
  if (!s) return undefined
  return parse(s, "yyyy-MM-dd", new Date())
}

function toStr(d: Date | undefined): string {
  return d ? format(d, "yyyy-MM-dd") : ""
}

/**
 * Radio group untuk opsi 2/3 hardcode. Sesuai pola Proses Pesanan —
 * lebih cepat dari Combobox (satu klik, tanpa buka dropdown).
 */
function FilterRadioGroup({
  name,
  value,
  onValueChange,
  options,
  allLabel = "Semua",
}: {
  name: string
  value: string
  onValueChange: (v: string) => void
  options: { value: string; label: string }[]
  allLabel?: string
}) {
  const items = [{ value: "__all", label: allLabel }, ...options]
  return (
    <RadioGroup
      value={value || "__all"}
      onValueChange={(v) => onValueChange(v === "__all" ? "" : v)}
      className="flex flex-wrap items-center gap-x-4 gap-y-1.5"
    >
      {items.map((opt) => {
        const id = `${name}-${opt.value}`
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-full border border-transparent px-2 py-1 text-sm transition-colors",
              (value || "__all") === opt.value
                ? "border-primary/30 bg-primary/5 text-primary"
                : "text-foreground hover:bg-muted/50"
            )}
          >
            <RadioGroupItem id={id} value={opt.value} />
            <span>{opt.label}</span>
          </label>
        )
      })}
    </RadioGroup>
  )
}

export function OrderFilters({
  query,
  onQueryChange,
  filters,
  onChange,
  leading,
}: {
  query: string
  onQueryChange: (v: string) => void
  filters: FilterState
  onChange: (f: FilterState) => void
  leading?: React.ReactNode
}) {
  const { data: locData } = useLocations()
  const { data: storeData } = useConnectedStores()
  const { data: couriersData } = useCouriers()

  const locations = (locData?.items ?? []).map((l) => ({
    value: l.id,
    label: l.locationName,
  }))

  const stores = (storeData ?? [])
    .filter((s) => !filters.channel || s.channel?.code === filters.channel)
    .map((s) => ({ value: s.shop_id, label: s.shop_name }))

  const couriers = (couriersData ?? []).map((c) => ({
    value: c.name,
    label: c.name,
  }))

  const hasActive = Object.values(filters).some(Boolean)
  const activeCount = [
    filters.channel,
    filters.store_id,
    filters.location_id,
    filters.content_type,
    filters.date_from || filters.date_to,
    filters.shipping_provider,
    filters.payment,
    filters.label_printed,
  ].filter(Boolean).length

  const dateRange = useMemo<DateRange | undefined>(() => {
    const from = toDate(filters.date_from)
    const to = toDate(filters.date_to)
    if (!from && !to) return undefined
    return { from, to }
  }, [filters.date_from, filters.date_to])

  return (
    <FilterToolbar
      search={query}
      onSearchChange={onQueryChange}
      searchPlaceholder="Cari no. pesanan, nama, SKU…"
      onReset={hasActive ? () => onChange(EMPTY) : undefined}
      hasFilter={hasActive}
      activeCount={activeCount}
      align="end"
      leading={leading}
    >
      <Combobox
        options={[{ value: "", label: "Semua Lokasi" }, ...locations]}
        value={filters.location_id}
        onChange={(v) => onChange({ ...filters, location_id: v ?? "" })}
        placeholder="Lokasi"
        searchPlaceholder="Cari lokasi"
        className="h-9 bg-background"
      />

      <Combobox
        options={CHANNEL_OPTIONS}
        value={filters.channel}
        onChange={(v) => onChange({ ...filters, channel: v ?? "", store_id: "" })}
        placeholder="Channel"
        searchPlaceholder="Cari channel"
        className="h-9 bg-background"
      />

      <Combobox
        options={[{ value: "", label: "Semua Toko" }, ...stores]}
        value={filters.store_id}
        onChange={(v) => onChange({ ...filters, store_id: v ?? "" })}
        placeholder="Toko"
        searchPlaceholder="Cari toko"
        className="h-9 bg-background"
      />

      <Combobox
        options={[{ value: "", label: "Semua Kurir" }, ...couriers]}
        value={filters.shipping_provider}
        onChange={(v) => onChange({ ...filters, shipping_provider: v ?? "" })}
        placeholder="Kurir"
        searchPlaceholder="Cari kurir"
        className="h-9 bg-background"
      />

      <Combobox
        options={CONTENT_OPTIONS}
        value={filters.content_type}
        onChange={(v) => onChange({ ...filters, content_type: v ?? "" })}
        placeholder="Isi Pesanan"
        searchPlaceholder="Cari tipe"
        className="h-9 bg-background"
      />

      {/* Opsi 2/3 pakai RadioGroup — 1 klik, tanpa buka dropdown. */}
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs font-medium text-muted-foreground">Pembayaran</label>
        <FilterRadioGroup
          name="payment"
          value={filters.payment}
          onValueChange={(v) => onChange({ ...filters, payment: v })}
          options={PAYMENT_OPTIONS}
        />
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs font-medium text-muted-foreground">Cetak Label</label>
        <FilterRadioGroup
          name="label_printed"
          value={filters.label_printed}
          onValueChange={(v) => onChange({ ...filters, label_printed: v })}
          options={LABEL_PRINTED_OPTIONS}
        />
      </div>

      <div className="sm:col-span-2">
        <DateRangePicker
          value={dateRange}
          onChange={(range) =>
            onChange({
              ...filters,
              date_from: toStr(range?.from),
              date_to: toStr(range?.to),
            })
          }
          placeholder="Pilih rentang tanggal"
          className="h-9 bg-background"
        />
      </div>
    </FilterToolbar>
  )
}

export { EMPTY as EMPTY_FILTERS }
