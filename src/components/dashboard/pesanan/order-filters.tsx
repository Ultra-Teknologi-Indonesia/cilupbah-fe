"use client"

import { FilterIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
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

export interface FilterState {
  channel: string
  store_id: string
  location_id: string
  content_type: string
  date_from: string
  date_to: string
}

const EMPTY: FilterState = { channel: "", store_id: "", location_id: "", content_type: "", date_from: "", date_to: "" }

export function OrderFilters({
  filters,
  onChange,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
}) {
  const { data: locData } = useLocations()
  const { data: storeData } = useConnectedStores()

  const locations = (locData?.data ?? []).map((l: { id: string; location_name: string }) => ({
    value: l.id,
    label: l.location_name,
  }))

  const stores = (storeData?.data ?? [])
    .filter((s: { channel_code?: string }) => !filters.channel || s.channel_code === filters.channel)
    .map((s: { shop_id: string; shop_name: string }) => ({
      value: s.shop_id,
      label: s.shop_name,
    }))

  const hasActive = Object.values(filters).some(Boolean)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterIcon className="h-4 w-4 text-muted-foreground" />

      <Combobox
        options={[{ value: "", label: "Semua Lokasi" }, ...locations]}
        value={filters.location_id}
        onValueChange={(v) => onChange({ ...filters, location_id: v })}
        placeholder="Lokasi"
        className="w-40"
      />

      <Combobox
        options={CHANNEL_OPTIONS}
        value={filters.channel}
        onValueChange={(v) => onChange({ ...filters, channel: v, store_id: "" })}
        placeholder="Channel"
        className="w-36"
      />

      <Combobox
        options={[{ value: "", label: "Semua Toko" }, ...stores]}
        value={filters.store_id}
        onValueChange={(v) => onChange({ ...filters, store_id: v })}
        placeholder="Toko"
        className="w-40"
      />

      <Combobox
        options={CONTENT_OPTIONS}
        value={filters.content_type}
        onValueChange={(v) => onChange({ ...filters, content_type: v })}
        placeholder="Isi Pesanan"
        className="w-40"
      />

      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          value={filters.date_from}
          onChange={(e) => onChange({ ...filters, date_from: e.target.value })}
          className="h-9 w-36 text-xs"
          placeholder="Dari"
        />
        <span className="text-muted-foreground text-xs">-</span>
        <Input
          type="date"
          value={filters.date_to}
          onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
          className="h-9 w-36 text-xs"
          placeholder="Sampai"
        />
      </div>

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY)} className="h-8 gap-1 text-xs">
          <XIcon className="h-3 w-3" />
          Reset
        </Button>
      )}
    </div>
  )
}

export { EMPTY as EMPTY_FILTERS }
