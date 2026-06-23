"use client"

import * as React from "react"
import Image from "next/image"
import {
  SearchIcon,
  RefreshCwIcon,
  MoreHorizontalIcon,
  Loader2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  TruckIcon,
  PackageIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  useMarkComplete,
  useOrdersByStage,
  useReadyToShip,
} from "@/hooks/proses-pesanan/use-fulfillment"
import type { FulfillmentOrder } from "@/types/proses-pesanan/fulfillment"
import { CHANNEL_MAP, STATUS_LABELS } from "@/types/pesanan/order"

import { ChannelBadge, OrderStatusBadge } from "../channel-badge"
import { BuatPicklistDialog } from "../picking/buat-picklist-dialog"
import { BuatPengirimanDialog } from "../shipping/buat-pengiriman-dialog"
import { DocActions } from "../picking/doc-actions"

export interface OrderTableActions {
  buatPicklist?: boolean
  buatPengiriman?: boolean
  cetakLabel?: boolean
  cetakPicklist?: boolean
  cetakFaktur?: boolean
  fakturLabel?: boolean
  suratJalan?: boolean
  siapDikirim?: boolean
  selesaikanPesanan?: boolean
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n)
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.success("Disalin ke clipboard")
}

function ChannelIcon({ source }: { source: string | null }) {
  if (!source) return null
  const ch = CHANNEL_MAP[source]
  if (!ch) return null
  const mask = `url(/channels/${source}.svg) center / contain no-repeat`
  return (
    <span
      className="inline-flex h-6 items-center gap-1.5 shrink-0 rounded-md px-1.5"
      style={{ backgroundColor: `${ch.color}10` }}
    >
      <span
        className="inline-block h-4 w-4 shrink-0"
        style={{ backgroundColor: ch.color, mask, WebkitMask: mask }}
      />
      <span className="text-xs font-semibold" style={{ color: ch.color }}>
        {ch.label}
      </span>
    </span>
  )
}

function OrderCard({
  order,
  actions,
  selected,
  onToggle,
  onShip,
  onComplete,
  shipPending,
  completePending,
}: {
  order: FulfillmentOrder
  actions: OrderTableActions
  selected: boolean
  onToggle: () => void
  onShip: (ids: string[]) => void
  onComplete: (ids: string[]) => void
  shipPending: boolean
  completePending: boolean
}) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-border/60 bg-card transition-all hover:border-border hover:shadow-sm",
        selected && "border-primary/40 bg-primary/[0.02]"
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border/40 px-4 py-2.5 sm:px-5">
        <Checkbox checked={selected} onCheckedChange={onToggle} className="mr-0.5" />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => copyToClipboard(order.salesorderNo)}
              className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold hover:text-primary transition-colors"
            >
              {order.salesorderNo}
              <CopyIcon className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Klik untuk salin No. Pesanan</TooltipContent>
        </Tooltip>

        {order.channelOrderNo && (
          <>
            <span className="text-border select-none">|</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => copyToClipboard(order.channelOrderNo!)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="text-[11px] font-medium text-muted-foreground/70">Ref:</span>
                  <span className="font-mono">{order.channelOrderNo}</span>
                  <CopyIcon className="h-2.5 w-2.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Klik untuk salin No. Referensi Channel</TooltipContent>
            </Tooltip>
          </>
        )}

        <span className="text-border select-none">|</span>
        <ChannelIcon source={order.source} />

        <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UserIcon className="h-3.5 w-3.5" />
            <span className="max-w-[180px] truncate font-medium text-foreground">
              {order.customerName || "—"}
            </span>
          </span>
          {order.transactionDate && (
            <>
              <span className="hidden text-border select-none sm:inline">|</span>
              <span className="hidden items-center gap-1.5 sm:inline-flex">
                <CalendarIcon className="h-3.5 w-3.5" />
                {formatDate(order.transactionDate)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Items */}
      {order.items.length > 0 && (
        <div className="border-b border-border/40 px-4 py-2.5 sm:px-5">
          <div className="flex flex-col gap-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.description || item.sku}
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-lg border border-border/60 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50">
                    <PackageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.description || item.sku}</p>
                  <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                </div>
                <span className="shrink-0 font-medium tabular-nums">×{item.qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-4 py-3.5 sm:grid-cols-4 sm:px-5">
        <div>
          <OrderStatusBadge status={order.status} />
          {order.totalQty != null && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              <PackageIcon className="h-3 w-3" />
              {order.totalQty} item · {order.totalSku ?? 0} SKU
            </p>
          )}
        </div>

        <div className="min-w-0">
          <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Lokasi
          </p>
          <p className="flex items-start gap-1 text-sm">
            <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="line-clamp-2">{order.locationName || "—"}</span>
          </p>
        </div>

        <div>
          <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Total
          </p>
          <p className="text-sm font-bold tabular-nums">{formatCurrency(order.grandTotal)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {order.isPaid ? (
              <span className="text-emerald-600 dark:text-emerald-400">Dibayar</span>
            ) : (
              "Belum dibayar"
            )}
          </p>
        </div>

        <div className="min-w-0">
          <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Kurir
          </p>
          {order.shippingProvider ? (
            <div className="flex items-start gap-1 text-sm">
              <TruckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="font-medium">{order.shippingProvider}</p>
                {order.trackingNumber && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(order.trackingNumber!)}
                        className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {order.trackingNumber}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Klik untuk salin resi</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 border-t border-border/40 px-4 py-2.5 sm:px-5">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {actions.buatPicklist && (
            <Button size="sm" variant="primary" onClick={onToggle}>
              Buat Picklist
            </Button>
          )}
          {actions.siapDikirim && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onShip([order.id])}
              disabled={shipPending}
            >
              {shipPending && <Loader2Icon className="animate-spin" />}
              Siap Dikirim
            </Button>
          )}
          {actions.selesaikanPesanan && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onComplete([order.id])}
              disabled={completePending}
            >
              {completePending && <Loader2Icon className="animate-spin" />}
              Selesaikan Pesanan
            </Button>
          )}
          {actions.cetakFaktur && (
            <Button size="sm" variant="outline" onClick={() => DocActions.invoice([order.id])}>
              Cetak Faktur
            </Button>
          )}
          {actions.cetakLabel && (
            <Button size="sm" variant="outline" onClick={() => DocActions.shippingLabel([order.id])}>
              Cetak Label
            </Button>
          )}
          {actions.cetakPicklist && (
            <Button size="sm" variant="outline" onClick={() => DocActions.pickList([order.id])}>
              Cetak Picklist
            </Button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Aksi lainnya">
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52">
            {actions.fakturLabel && (
              <DropdownMenuItem onSelect={() => DocActions.invoiceAndLabel([order.id])}>
                Cetak Faktur & Label
              </DropdownMenuItem>
            )}
            {actions.suratJalan && (
              <DropdownMenuItem onSelect={() => DocActions.suratJalanAndInvoice([order.id])}>
                Surat Jalan + Faktur
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function FulfillmentOrdersTable({
  stage,
  actions,
  searchPlaceholder = "Cari no. pesanan…",
}: {
  stage: string
  actions: OrderTableActions
  searchPlaceholder?: string
}) {
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [picklistOpen, setPicklistOpen] = React.useState(false)
  const [pengirimanOpen, setPengirimanOpen] = React.useState(false)

  React.useEffect(() => {
    setSelected(new Set())
    setPage(1)
    setSearch("")
    setDebounced("")
  }, [stage])

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = React.useMemo(
    () => ({ q: debounced || undefined, page, per_page: 20 }),
    [debounced, page]
  )
  const { data, isLoading, isFetching, refetch } = useOrdersByStage(stage, params)
  const readyToShip = useReadyToShip()
  const markComplete = useMarkComplete()

  const orders = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: 20, total: 0 }

  const pageIds = orders.map((o) => o.id)
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const someSelected = pageIds.some((id) => selected.has(id))
  const selectedIds = React.useMemo(() => Array.from(selected), [selected])

  const clearSelection = () => setSelected(new Set())
  const toggleAll = () => (allSelected ? clearSelection() : setSelected(new Set(pageIds)))
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const selectedOrders = orders.filter((o) => selected.has(o.id))
  const distinctLocations = Array.from(
    new Set(selectedOrders.map((o) => o.locationId).filter(Boolean))
  )
  const picklistLocationId = distinctLocations[0] ?? null
  const picklistLocationName =
    selectedOrders.find((o) => o.locationId === picklistLocationId)?.locationName ?? null

  const handleShip = async (ids: string[]) => {
    if (!ids.length) return
    try {
      const results = await readyToShip.mutateAsync(ids)
      const ok = results.filter((r) => r.status === "success").length
      const failed = results.filter((r) => r.status === "failed")
      const skipped = results.filter((r) => r.status === "skipped").length
      if (failed.length) {
        toast.error(
          `${ok} berhasil, ${failed.length} gagal${skipped ? `, ${skipped} dilewati` : ""}.` +
            (failed[0].message ? ` (${failed[0].message})` : "")
        )
      } else {
        toast.success(
          `${ok} pesanan diteruskan "Siap Dikirim"${skipped ? `, ${skipped} dilewati` : ""}.`
        )
      }
      clearSelection()
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Gagal memproses Siap Dikirim."
      toast.error(msg)
    }
  }

  const handleComplete = async (ids: string[]) => {
    if (!ids.length) return
    try {
      const n = await markComplete.mutateAsync(ids)
      toast.success(`${n} pesanan diselesaikan.`)
      clearSelection()
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Gagal menyelesaikan pesanan."
      toast.error(msg)
    }
  }

  return (
    <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
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
            placeholder={searchPlaceholder}
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

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-y border-primary/20 bg-primary/5 px-4 py-2.5 sm:px-5">
          <Checkbox
            checked={allSelected ? true : someSelected ? "indeterminate" : false}
            onCheckedChange={toggleAll}
          />
          <span className="mr-1 text-sm font-medium">{selected.size} pesanan dipilih</span>
          {actions.buatPicklist && (
            <Button size="sm" variant="primary" onClick={() => setPicklistOpen(true)}>
              Buat Picklist
            </Button>
          )}
          {actions.buatPengiriman && (
            <Button size="sm" variant="primary" onClick={() => setPengirimanOpen(true)}>
              Buat Pengiriman
            </Button>
          )}
          {actions.cetakFaktur && (
            <Button size="sm" variant="outline" onClick={() => DocActions.invoice(selectedIds)}>
              Cetak Faktur
            </Button>
          )}
          {actions.cetakLabel && (
            <Button size="sm" variant="outline" onClick={() => DocActions.shippingLabel(selectedIds)}>
              Cetak Label
            </Button>
          )}
          {actions.cetakPicklist && (
            <Button size="sm" variant="outline" onClick={() => DocActions.pickList(selectedIds)}>
              Cetak Picklist
            </Button>
          )}
          {actions.fakturLabel && (
            <Button size="sm" variant="outline" onClick={() => DocActions.invoiceAndLabel(selectedIds)}>
              Faktur & Label
            </Button>
          )}
          {actions.suratJalan && (
            <Button size="sm" variant="outline" onClick={() => DocActions.suratJalanAndInvoice(selectedIds)}>
              Surat Jalan + Faktur
            </Button>
          )}
          {actions.siapDikirim && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleShip(selectedIds)}
              disabled={readyToShip.isPending}
            >
              {readyToShip.isPending && <Loader2Icon className="animate-spin" />}
              Siap Dikirim
            </Button>
          )}
          {actions.selesaikanPesanan && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleComplete(selectedIds)}
              disabled={markComplete.isPending}
            >
              {markComplete.isPending && <Loader2Icon className="animate-spin" />}
              Selesaikan Pesanan
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={clearSelection} className="ml-auto">
            Batal
          </Button>
        </div>
      )}

      {/* Card list */}
      <div className="px-4 py-3 sm:px-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Tidak ada pesanan.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Select all row */}
            {selected.size === 0 && orders.length > 0 && (
              <div className="flex items-center gap-2 px-1">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                />
                <span className="text-xs text-muted-foreground">Pilih semua</span>
              </div>
            )}

            {orders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                actions={actions}
                selected={selected.has(o.id)}
                onToggle={() => toggleOne(o.id)}
                onShip={handleShip}
                onComplete={handleComplete}
                shipPending={readyToShip.isPending}
                completePending={markComplete.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3 border-t border-border/40 px-4 py-3 sm:px-5">
        <span className="text-xs text-muted-foreground">
          Halaman {meta.current_page} dari {meta.last_page}
        </span>
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

      {actions.buatPicklist && (
        <BuatPicklistDialog
          open={picklistOpen}
          onOpenChange={setPicklistOpen}
          orderIds={selectedIds}
          locationId={picklistLocationId}
          locationName={picklistLocationName}
          multiLocation={distinctLocations.length > 1}
          onCreated={clearSelection}
        />
      )}

      {actions.buatPengiriman && (
        <BuatPengirimanDialog
          open={pengirimanOpen}
          onOpenChange={setPengirimanOpen}
          orderIds={selectedIds}
          locationId={picklistLocationId}
          locationName={picklistLocationName}
          multiLocation={distinctLocations.length > 1}
          onCreated={clearSelection}
        />
      )}
    </LiquidGlass>
  )
}

export const ORDER_ACTION_PRESET = {
  pickingBelum: { buatPicklist: true, cetakLabel: true, cetakPicklist: true, siapDikirim: true },
  docSet: { cetakFaktur: true, cetakLabel: true, fakturLabel: true, suratJalan: true, siapDikirim: true },
  shippingSiapKirim: { buatPengiriman: true, cetakLabel: true, cetakFaktur: true },
  sudahDikirim: { selesaikanPesanan: true, cetakLabel: true },
  selesai: { cetakFaktur: true, cetakLabel: true },
} satisfies Record<string, OrderTableActions>
