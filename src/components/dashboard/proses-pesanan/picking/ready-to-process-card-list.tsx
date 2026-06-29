"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { BulkActionBar } from "@/components/ui/bulk-action-bar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrderCard } from "@/components/dashboard/pesanan/order-card"
import {
  fulfillmentKeys,
  useCreatePicklist,
  useOrdersByStage,
  usePickers,
} from "@/hooks/proses-pesanan/use-fulfillment"
import { orderKeys } from "@/hooks/pesanan/use-orders"
import { fulfillmentToOrder } from "@/lib/proses-pesanan/order-card-mapper"
import { cn } from "@/lib/utils"

const PER_PAGE_OPTIONS = [10, 20, 50]

export function ReadyToProcessCardList() {
  const qc = useQueryClient()
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(20)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [pickerId, setPickerId] = React.useState<string>("")

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = React.useMemo(
    () => ({ q: debounced || undefined, page, per_page: perPage }),
    [debounced, page, perPage]
  )

  const { data, isLoading, isFetching, refetch } = useOrdersByStage(
    "ready-to-process",
    params
  )
  const orders = React.useMemo(() => data?.items ?? [], [data])
  const meta =
    data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

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

  const pickers = usePickers(locationId ?? undefined, !!locationId)
  const createPicklist = useCreatePicklist()

  const prevLocationRef = React.useRef<string | null>(locationId)
  if (prevLocationRef.current !== locationId) {
    prevLocationRef.current = locationId
    if (pickerId !== "") setPickerId("")
  }

  const clearSelection = () => {
    setSelected(new Set())
    setPickerId("")
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
    <LiquidGlass
      radius={20}
      intensity="subtle"
      className="bg-white/30 dark:bg-white/[0.04]"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
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
          <div className="py-16 text-center text-sm text-muted-foreground">
            Belum ada pesanan yang siap dipick
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
                      onClick={handleCreatePicklist}
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

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3 border-t border-border/40 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Per halaman</span>
          <Select
            value={String(perPage)}
            onValueChange={(v) => {
              setPerPage(Number(v))
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PER_PAGE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ml-2">
            Halaman {meta.current_page} dari {meta.last_page}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Sebelumnya"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Berikutnya"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

    </LiquidGlass>
  )
}
