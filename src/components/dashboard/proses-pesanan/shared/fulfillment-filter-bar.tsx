"use client"

import * as React from "react"
import { FilterIcon, SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { useCouriers } from "@/hooks/proses-pesanan/use-fulfillment"

// Filter yang tersedia untuk halaman-halaman Proses Pesanan.
// `zone` di-list tapi belum di-render (belum ada endpoint lookup zona).
export type FulfillmentFilterField =
  | "courier"
  | "location"
  | "channel"
  | "store"
  | "label_printed"
  | "date"
  | "zone"
  | "payment"
  | "courier_type"
  | "shipment_type"
  | "status"

export interface FulfillmentFilterValue {
  shipping_provider?: string
  courier_code?: string
  location_id?: string
  source?: string
  channel_shop_id?: string
  label_printed?: string
  date_from?: string
  date_to?: string
  zone_id?: string
  payment?: string
  courier_type?: string
  shipment_type?: string
  status?: string
  channel_status?: string
}

interface Props {
  value: FulfillmentFilterValue
  onChange: (v: FulfillmentFilterValue) => void
  fields: FulfillmentFilterField[]
  statusOptions?: { value: string; label: string }[]
  channelStatusOptions?: { value: string; label: string }[]
  courierMode?: "shipping_provider" | "courier_code"
  excludeTransit?: boolean
  search?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  className?: string
}

const CHANNEL_OPTIONS = [
  { value: "shopee", label: "Shopee" },
  { value: "tiktok", label: "TikTok" },
  { value: "lazada", label: "Lazada" },
  { value: "tokopedia", label: "Tokopedia" },
]

const LABEL_PRINTED_OPTIONS = [
  { value: "yes", label: "Sudah cetak" },
  { value: "no", label: "Belum cetak" },
]

const PAYMENT_OPTIONS = [
  { value: "cod", label: "COD" },
  { value: "noncod", label: "Non-COD" },
]

const COURIER_TYPE_OPTIONS = [
  { value: "regular", label: "Regular" },
  { value: "instant", label: "Instan" },
]

const SHIPMENT_TYPE_OPTIONS = [
  { value: "REGULAR", label: "Reguler" },
  { value: "INSTANT", label: "Instant" },
]

function FieldWrapper({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-[180px] flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

export function FulfillmentFilterBar({
  value,
  onChange,
  fields,
  statusOptions,
  channelStatusOptions,
  courierMode = "shipping_provider",
  excludeTransit,
  search,
  onSearchChange,
  searchPlaceholder = "Cari…",
  className,
}: Props) {
  const [open, setOpen] = React.useState(false)

  const includes = React.useCallback(
    (f: FulfillmentFilterField) => fields.includes(f),
    [fields]
  )

  const couriers = useCouriers(includes("courier"))
  const locations = useLocations(includes("location") ? { perPage: 200 } : {})
  const stores = useConnectedStores()

  const courierOptions = React.useMemo(() => {
    const list = couriers.data ?? []
    return list.map((c) => ({
      value: courierMode === "courier_code" ? (c.code ?? c.id) : c.name,
      label: c.name,
    }))
  }, [couriers.data, courierMode])

  const locationOptions = React.useMemo(() => {
    const list = locations.data?.items ?? []
    const filtered = excludeTransit
      ? list.filter((l) => !l.locationName.toLowerCase().includes("transit"))
      : list
    return filtered.map((l) => ({ value: l.id, label: l.locationName }))
  }, [locations.data, excludeTransit])

  const storeOptions = React.useMemo(() => {
    const list = stores.data ?? []
    return list.map((s) => ({ value: s.shop_id, label: s.shop_name }))
  }, [stores.data])

  const activeCount = React.useMemo(() => {
    let n = 0
    if (value.shipping_provider) n++
    if (value.courier_code) n++
    if (value.location_id) n++
    if (value.source) n++
    if (value.channel_shop_id) n++
    if (value.label_printed) n++
    if (value.date_from || value.date_to) n++
    if (value.zone_id) n++
    if (value.payment) n++
    if (value.courier_type) n++
    if (value.shipment_type) n++
    if (value.status) n++
    if (value.channel_status) n++
    return n
  }, [value])

  const hasFilter = activeCount > 0
  const hasChildren = fields.some((f) => f !== "zone")

  function patch(next: Partial<FulfillmentFilterValue>) {
    onChange({ ...value, ...next })
  }

  function reset() {
    onChange({})
    setOpen(false)
  }

  function courierChange(v: string | null) {
    if (courierMode === "courier_code") {
      patch({ courier_code: v ?? undefined })
    } else {
      patch({ shipping_provider: v ?? undefined })
    }
  }
  const courierValue =
    courierMode === "courier_code" ? value.courier_code ?? null : value.shipping_provider ?? null

  // Untuk field `status`: kalau `channelStatusOptions` disediakan (halaman
  // Sudah Dikirim / Selesai) map ke `channel_status`, kalau tidak map ke `status`.
  const useChannelStatus = Boolean(channelStatusOptions?.length)
  const statusList = useChannelStatus ? channelStatusOptions! : statusOptions ?? []
  const statusValue = useChannelStatus ? value.channel_status ?? null : value.status ?? null

  function statusChange(v: string | null) {
    if (useChannelStatus) patch({ channel_status: v ?? undefined })
    else patch({ status: v ?? undefined })
  }

  return (
    <div className={cn("border-b border-border/40", className)}>
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 sm:px-5">
        {onSearchChange != null && (
          <div className="relative w-full sm:w-auto sm:min-w-[220px]">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 rounded-full bg-background pl-9 pr-8"
            />
            {(search?.length ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Bersihkan pencarian"
                className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>
        )}

        {hasChildren && (
          <Button
            variant={open ? "secondary" : "outline"}
            size="sm"
            className={cn(
              "h-9 gap-2 rounded-full transition-colors",
              open && "bg-primary/10 text-primary hover:bg-primary/15",
              !open && activeCount > 0 && "border-primary/40 text-primary"
            )}
            onClick={() => setOpen(!open)}
          >
            <FilterIcon className="size-4" />
            Filter
            {activeCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        )}

        {hasFilter && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto flex items-center gap-1 text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
          >
            <XIcon className="size-3.5" />
            Reset
          </button>
        )}
      </div>

      {hasChildren && (
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-wrap gap-3 px-4 pb-4 pt-1 sm:px-5">
              {includes("courier") && (
                <FieldWrapper label="Kurir">
                  <Combobox
                    options={courierOptions}
                    value={courierValue}
                    onChange={courierChange}
                    placeholder="Semua kurir"
                    searchPlaceholder="Cari kurir"
                  />
                </FieldWrapper>
              )}
              {includes("location") && (
                <FieldWrapper label="Gudang">
                  <Combobox
                    options={locationOptions}
                    value={value.location_id ?? null}
                    onChange={(v) => patch({ location_id: v ?? undefined })}
                    placeholder="Semua gudang"
                    searchPlaceholder="Cari gudang"
                  />
                </FieldWrapper>
              )}
              {includes("channel") && (
                <FieldWrapper label="Channel">
                  <Combobox
                    options={CHANNEL_OPTIONS}
                    value={value.source ?? null}
                    onChange={(v) => patch({ source: v ?? undefined })}
                    placeholder="Semua channel"
                    searchPlaceholder="Cari channel"
                  />
                </FieldWrapper>
              )}
              {includes("store") && (
                <FieldWrapper label="Toko">
                  <Combobox
                    options={storeOptions}
                    value={value.channel_shop_id ?? null}
                    onChange={(v) => patch({ channel_shop_id: v ?? undefined })}
                    placeholder="Semua toko"
                    searchPlaceholder="Cari toko"
                  />
                </FieldWrapper>
              )}
              {includes("label_printed") && (
                <FieldWrapper label="Label">
                  <Combobox
                    options={LABEL_PRINTED_OPTIONS}
                    value={value.label_printed ?? null}
                    onChange={(v) => patch({ label_printed: v ?? undefined })}
                    placeholder="Semua"
                    searchPlaceholder="Cari"
                  />
                </FieldWrapper>
              )}
              {includes("payment") && (
                <FieldWrapper label="Pembayaran">
                  <Combobox
                    options={PAYMENT_OPTIONS}
                    value={value.payment ?? null}
                    onChange={(v) => patch({ payment: v ?? undefined })}
                    placeholder="Semua"
                    searchPlaceholder="Cari"
                  />
                </FieldWrapper>
              )}
              {includes("courier_type") && (
                <FieldWrapper label="Jenis Kurir">
                  <Combobox
                    options={COURIER_TYPE_OPTIONS}
                    value={value.courier_type ?? null}
                    onChange={(v) => patch({ courier_type: v ?? undefined })}
                    placeholder="Semua"
                    searchPlaceholder="Cari"
                  />
                </FieldWrapper>
              )}
              {includes("shipment_type") && (
                <FieldWrapper label="Tipe Pengiriman">
                  <Combobox
                    options={SHIPMENT_TYPE_OPTIONS}
                    value={value.shipment_type ?? null}
                    onChange={(v) => patch({ shipment_type: v ?? undefined })}
                    placeholder="Semua"
                    searchPlaceholder="Cari"
                  />
                </FieldWrapper>
              )}
              {includes("status") && statusList.length > 0 && (
                <FieldWrapper label="Status">
                  <Combobox
                    options={statusList}
                    value={statusValue}
                    onChange={statusChange}
                    placeholder="Semua status"
                    searchPlaceholder="Cari status"
                  />
                </FieldWrapper>
              )}
              {includes("date") && (
                <FieldWrapper label="Tanggal">
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={value.date_from ?? ""}
                      onChange={(e) => patch({ date_from: e.target.value || undefined })}
                      className="h-10 rounded-full"
                    />
                    <span className="text-xs text-muted-foreground">s/d</span>
                    <Input
                      type="date"
                      value={value.date_to ?? ""}
                      onChange={(e) => patch({ date_to: e.target.value || undefined })}
                      className="h-10 rounded-full"
                    />
                  </div>
                </FieldWrapper>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
