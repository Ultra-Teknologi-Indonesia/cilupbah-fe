"use client"

import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
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
  query,
  onQueryChange,
  filters,
  onChange,
}: {
  query: string
  onQueryChange: (v: string) => void
  filters: FilterState
  onChange: (f: FilterState) => void
}) {
  const { data: locData } = useLocations()
  const { data: storeData } = useConnectedStores()

  const locations = (locData?.items ?? []).map((l) => ({
    value: l.id,
    label: l.locationName,
  }))

  const stores = (storeData ?? [])
    .filter((s) => !filters.channel || s.channel?.code === filters.channel)
    .map((s) => ({
      value: s.shop_id,
      label: s.shop_name,
    }))

  const hasActive = Object.values(filters).some(Boolean)
  const activeCount = [
    filters.channel,
    filters.store_id,
    filters.location_id,
    filters.content_type,
    filters.date_from || filters.date_to,
  ].filter(Boolean).length

  return (
    <FilterToolbar
      search={query}
      onSearchChange={onQueryChange}
      searchPlaceholder="Cari no. pesanan, nama pelanggan, atau SKU..."
      onReset={hasActive ? () => onChange(EMPTY) : undefined}
      hasFilter={hasActive}
      activeCount={activeCount}
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
        options={CONTENT_OPTIONS}
        value={filters.content_type}
        onChange={(v) => onChange({ ...filters, content_type: v ?? "" })}
        placeholder="Isi Pesanan"
        searchPlaceholder="Cari tipe"
        className="h-9 bg-background"
      />

      <div className="flex items-center gap-2 sm:col-span-2">
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
            Dari tanggal
          </label>
          <Input
            type="date"
            value={filters.date_from}
            onChange={(e) => onChange({ ...filters, date_from: e.target.value })}
            className="h-9 bg-background text-xs"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
            Sampai tanggal
          </label>
          <Input
            type="date"
            value={filters.date_to}
            onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
            className="h-9 bg-background text-xs"
          />
        </div>
      </div>
    </FilterToolbar>
  )
}

export { EMPTY as EMPTY_FILTERS }
