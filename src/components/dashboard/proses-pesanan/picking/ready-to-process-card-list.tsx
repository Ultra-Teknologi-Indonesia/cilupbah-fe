"use client"

import * as React from "react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import {
  Loader2Icon,
  PackageOpenIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { BulkActionBar } from "@/components/ui/bulk-action-bar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { OrderCard } from "@/components/dashboard/pesanan/order-card"
import { BulkBuatPicklistConfirmDialog } from "@/components/dashboard/proses-pesanan/picking/bulk-buat-picklist-confirm-dialog"
import {
  fulfillmentKeys,
  useCreatePicklist,
  useOrdersByStage,
  usePickers,
} from "@/hooks/proses-pesanan/use-fulfillment"
import { orderKeys } from "@/hooks/pesanan/use-orders"
import { fulfillmentToOrder } from "@/lib/proses-pesanan/order-card-mapper"
import { cn } from "@/lib/utils"
import { FilterIcon } from "lucide-react"

const SOURCE_OPTIONS = [
  { value: "", label: "Semua Channel" },
  { value: "shopee", label: "Shopee" },
  { value: "tiktok", label: "TikTok" },
  { value: "lazada", label: "Lazada" },
]

function isOverdue(shipByDate: string | null): boolean {
  if (!shipByDate) return false
  const d = new Date(shipByDate)
  if (Number.isNaN(d.getTime())) return false
  return d.getTime() < Date.now()
}

export function ReadyToProcessCardList() {
  const qc = useQueryClient()
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(20)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [pickerId, setPickerId] = React.useState<string>("")
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [source, setSource] = React.useState<string>("")
  const [onlyPriority, setOnlyPriority] = React.useState(false)
  const [onlyOverdue, setOnlyOverdue] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = React.useMemo(
    () => ({
      q: debounced || undefined,
      source: source || undefined,
      page,
      per_page: perPage,
    }),
    [debounced, source, page, perPage]
  )

  const { data, isLoading, isFetching, refetch } = useOrdersByStage(
    "ready-to-process",
    params
  )
  const rawOrders = React.useMemo(() => data?.items ?? [], [data])
  const meta =
    data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

  const orders = React.useMemo(() => {
    return rawOrders.filter((o) => {
      if (onlyPriority && !o.priorityFulfillment) return false
      if (onlyOverdue && !isOverdue(o.shipByDate)) return false
      return true
    })
  }, [rawOrders, onlyPriority, onlyOverdue])

  const mappedOrders = React.useMemo(
    () => orders.map((o) => ({ raw: o, ui: fulfillmentToOrder(o) })),
    [orders]
  )

  const pageIds = orders.map((o) => o.id)
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const someSelected = pageIds.some((id) => selected.has(id))

  const selectedOrders = orders.filter((o) => selected.has(o.id))
  const distinctLocations = Array.from(
    new Set(selectedOrders.map((o) => o.locationId).filter(Boolean))
  ) as string[]
  const locationId = distinctLocations[0] ?? null
  const multiLocation = distinctLocations.length > 1
  const locationName = selectedOrders[0]?.locationName ?? null

  const pickers = usePickers(locationId ?? undefined, !!locationId)
  const createPicklist = useCreatePicklist()
  const selectedPicker = pickers.data?.find((p) => p.id === pickerId) ?? null

  const prevLocationRef = React.useRef<string | null>(locationId)
  if (prevLocationRef.current !== locationId) {
    prevLocationRef.current = locationId
    if (pickerId !== "") setPickerId("")
  }

  const activeFilterCount =
    (source ? 1 : 0) + (onlyPriority ? 1 : 0) + (onlyOverdue ? 1 : 0)

  const clearSelection = () => {
    setSelected(new Set())
    setPickerId("")
  }

  const resetFilters = () => {
    setSource("")
    setOnlyPriority(false)
    setOnlyOverdue(false)
    setPage(1)
  }

  const toggleAll = () => {
    if (allSelected) {
      clearSelection()
    } else {
      setSelected(new Set(pageIds))
    }
  }

  const toggleOne = (id: string, v: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (v) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleCreatePicklist = async () => {
    if (!locationId) {
      toast.error("Lokasi pesanan tidak ditemukan")
      return
    }
    if (multiLocation) {
      toast.error("Pesanan terpilih berasal dari lokasi berbeda")
      return
    }
    if (!pickerId) {
      toast.error("Pilih picker terlebih dahulu")
      return
    }
    try {
      const res = await createPicklist.mutateAsync({
        order_ids: Array.from(selected),
        location_id: locationId,
        picker_id: pickerId,
      })
      const no = res?.picklistNo ?? ""
      toast.success(
        no ? `Picklist ${no} berhasil dibuat` : "Picklist berhasil dibuat"
      )
      clearSelection()
      setConfirmOpen(false)
      qc.invalidateQueries({ queryKey: fulfillmentKeys.all })
      qc.invalidateQueries({ queryKey: orderKeys.all })
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Gagal membuat picklist"
      toast.error(msg)
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Cari no. pesanan…"
              className="pl-9"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={activeFilterCount > 0 ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "h-9 gap-2 rounded-full",
                  activeFilterCount > 0 && "border-primary/40 text-primary"
                )}
              >
                <FilterIcon className="size-4" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Channel
                </label>
                <Select
                  value={source || "__all"}
                  onValueChange={(v) => {
                    setSource(v === "__all" ? "" : v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((o) => (
                      <SelectItem key={o.value || "__all"} value={o.value || "__all"}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={onlyPriority}
                  onCheckedChange={(v) => setOnlyPriority(!!v)}
                />
                <span>Hanya prioritas (FBT/dipromosikan)</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={onlyOverdue}
                  onCheckedChange={(v) => setOnlyOverdue(!!v)}
                />
                <span>Hanya overdue ship-by-date</span>
              </label>

              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={resetFilters}
                >
                  Reset Filter
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full p-1.5 transition-colors hover:bg-muted"
            aria-label="Muat ulang"
          >
            <RefreshCwIcon className={cn("size-4", isFetching && "animate-spin")} />
          </button>
          <span className="flex items-center gap-1.5">
            Total <Badge>{meta.total}</Badge>
          </span>
        </div>
      </div>

      {/* List */}
      <div className="px-4 pb-4 sm:px-5">
        {isLoading ? (
          <div className="flex flex-col gap-3 py-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-xl border border-border/60 bg-muted/30"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted/60">
              <PackageOpenIcon className="size-8 text-muted-foreground/70" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Belum ada pesanan siap dipick</p>
              <p className="text-xs text-muted-foreground">
                Pesanan akan muncul di sini setelah klik &quot;Proses Pesanan&quot; di
                halaman Pesanan.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/pesanan">Buka Halaman Pesanan</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={toggleAll}
              />
              <span className="text-xs text-muted-foreground">
                Pilih Semua di halaman ini
              </span>
            </div>

            <BulkActionBar
              count={selected.size}
              onClear={clearSelection}
              label={(n) => `${n} pesanan dipilih`}
              message={
                multiLocation ? (
                  <span className="text-xs text-destructive">
                    Pesanan dari lokasi berbeda — pilih dari satu lokasi saja
                  </span>
                ) : null
              }
              actions={
                multiLocation ? null : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Picker</span>
                      <Select
                        value={pickerId}
                        onValueChange={setPickerId}
                        disabled={!locationId || pickers.isLoading}
                      >
                        <SelectTrigger className="h-9 w-56">
                          <SelectValue
                            placeholder={
                              pickers.isLoading ? "Memuat…" : "Pilih picker…"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {pickers.data?.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setConfirmOpen(true)}
                      disabled={createPicklist.isPending || !pickerId}
                    >
                      {createPicklist.isPending && (
                        <Loader2Icon className="animate-spin" />
                      )}
                      Buat Picklist
                    </Button>
                  </>
                )
              }
            />

            {mappedOrders.map(({ raw, ui }) => (
              <OrderCard
                key={raw.id}
                order={ui}
                variant="outbound-ready"
                selected={selected.has(raw.id)}
                onSelectedChange={(v) => toggleOne(raw.id, !!v)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <SimplePagination
          page={meta.current_page}
          lastPage={meta.last_page}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={(s) => {
            setPerPage(s)
            setPage(1)
          }}
          pageSizeOptions={[10, 20, 50]}
          isFetching={isFetching}
          label="pesanan"
          total={meta.total}
        />
      </div>

      <BulkBuatPicklistConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        selectedOrders={selectedOrders}
        pickerName={selectedPicker?.name ?? null}
        pickerEmail={selectedPicker?.email ?? null}
        locationName={locationName}
        loading={createPicklist.isPending}
        onConfirm={handleCreatePicklist}
      />
    </div>
  )
}
