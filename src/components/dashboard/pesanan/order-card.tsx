"use client"

import * as React from "react"
import Image from "next/image"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import {
  CopyIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  TruckIcon,
  EyeIcon,
  PrinterIcon,
  PackageIcon,
  CheckCircleIcon,
  WarehouseIcon,
  ArrowRightIcon,
  FileTextIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  ClipboardListIcon,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { BuatPicklistDialog } from "@/components/dashboard/proses-pesanan/picking/buat-picklist-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  type Order,
  type OrderItem,
  type OrderTab,
  type SubFilter,
  STATUS_LABELS,
  CHANNEL_MAP,
} from "@/types/pesanan/order"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useMarkComplete,
  useRequestAwb,
  useMoveToReady,
  useAcceptCancelRequest,
  useRejectCancelRequest,
  useAcceptReturn,
  useRejectReturn,
  useRelocateOrder,
} from "@/hooks/pesanan/use-order-actions"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"

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
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex h-6 items-center gap-1.5 shrink-0 rounded-md px-1.5"
          style={{ backgroundColor: `${ch.color}10` }}
        >
          <span
            className="inline-block h-4 w-4 shrink-0"
            style={{
              backgroundColor: ch.color,
              mask,
              WebkitMask: mask,
            }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: ch.color }}
          >
            {ch.label}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{ch.label}</TooltipContent>
    </Tooltip>
  )
}

function ItemRow({ item }: { item: OrderItem }) {
  return (
    <div className="flex items-center gap-3">
      {item.image_url ? (
        <Image
          src={item.image_url}
          alt={item.description || item.sku}
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-lg border border-border/60 object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60">
          <PackageIcon className="h-5 w-5 text-muted-foreground/60" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {item.description || item.sku}
        </p>
        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
      </div>
      <span className="shrink-0 text-sm text-foreground tabular-nums">
        x {item.qty_in_base}
      </span>
    </div>
  )
}

function RelocateDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [locationId, setLocationId] = React.useState("")
  const { data: locationsData } = useLocations({ perPage: 50 })
  const relocate = useRelocateOrder()

  const locations = React.useMemo(() => {
    const items = locationsData?.items ?? []
    return items.filter((l) => l.id !== order.location_id)
  }, [locationsData, order.location_id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Gudang Pengambilan</DialogTitle>
          <DialogDescription>
            Pilih gudang baru untuk pesanan {order.salesorder_no}
          </DialogDescription>
        </DialogHeader>
        <Select value={locationId} onValueChange={setLocationId}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih gudang..." />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.locationName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            disabled={!locationId || relocate.isPending}
            onClick={() => {
              relocate.mutate(
                { orderId: order.id, locationId },
                { onSuccess: () => onOpenChange(false) }
              )
            }}
          >
            {relocate.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OrderActions({
  order,
  tab,
  subFilter,
}: {
  order: Order
  tab: OrderTab
  subFilter: SubFilter
}) {
  const [completeOpen, setCompleteOpen] = React.useState(false)
  const [relocateOpen, setRelocateOpen] = React.useState(false)

  const markComplete = useMarkComplete()
  const requestAwb = useRequestAwb()
  const moveToReady = useMoveToReady()
  const acceptCancel = useAcceptCancelRequest()
  const rejectCancel = useRejectCancelRequest()
  const acceptReturn = useAcceptReturn()
  const rejectReturn = useRejectReturn()

  const isMarketplace = !!order.source && order.source !== "manual"

  const handlePrintLabel = () => {
    if (isMarketplace) {
      window.open(
        `/dashboard/document-preview/shipping-label/${order.id}`,
        "_blank",
        "noopener,noreferrer",
      )
    } else {
      toast.info("Cetak resi hanya tersedia untuk pesanan marketplace")
    }
  }

  const handlePrintInvoice = () => {
    window.open(`/api/app/sales/${order.id}/invoice`, "_blank")
  }

  const busy =
    markComplete.isPending ||
    requestAwb.isPending ||
    moveToReady.isPending ||
    acceptCancel.isPending ||
    rejectCancel.isPending ||
    acceptReturn.isPending ||
    rejectReturn.isPending

  if (tab === "unpaid") return null

  if (tab === "ready-to-process") {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => setRelocateOpen(true)}
        >
          <WarehouseIcon className="h-3.5 w-3.5" />
          Edit Gudang
        </Button>
        {!order.shipping?.tracking_number && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={busy}
            onClick={() => requestAwb.mutate({ orderId: order.id })}
          >
            <TruckIcon className="h-3.5 w-3.5" />
            Atur Pengiriman
          </Button>
        )}
        {order.shipping?.tracking_number && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={busy}
            onClick={handlePrintLabel}
          >
            <PrinterIcon className="h-3.5 w-3.5" />
            Cetak Label
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={() => setCompleteOpen(true)}
        >
          <CheckCircleIcon className="h-3.5 w-3.5" />
          Selesaikan
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={() => moveToReady.mutate([order.id])}
        >
          <ArrowRightIcon className="h-3.5 w-3.5" />
          {moveToReady.isPending ? "Memproses..." : "Proses Pesanan"}
        </Button>
        <ConfirmDialog
          open={completeOpen}
          onOpenChange={setCompleteOpen}
          title="Selesaikan pesanan ini?"
          description={`Pesanan ${order.salesorder_no} akan ditandai selesai.`}
          confirmLabel="Ya, Selesaikan"
          cancelLabel="Batal"
          onConfirm={() => {
            setCompleteOpen(false)
            markComplete.mutate([order.id])
          }}
        />
        <RelocateDialog order={order} open={relocateOpen} onOpenChange={setRelocateOpen} />
      </>
    )
  }

  if (tab === "in-transit") {
    return (
      <>
        {order.shipping?.tracking_number && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={busy}
            onClick={handlePrintLabel}
          >
            <PrinterIcon className="h-3.5 w-3.5" />
            Cetak Resi
          </Button>
        )}
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={() => setCompleteOpen(true)}
        >
          <CheckCircleIcon className="h-3.5 w-3.5" />
          {markComplete.isPending ? "Memproses..." : "Selesaikan"}
        </Button>
        <ConfirmDialog
          open={completeOpen}
          onOpenChange={setCompleteOpen}
          title="Selesaikan pesanan ini?"
          description={`Pesanan ${order.salesorder_no} akan ditandai selesai.`}
          confirmLabel="Ya, Selesaikan"
          cancelLabel="Batal"
          onConfirm={() => {
            setCompleteOpen(false)
            markComplete.mutate([order.id])
          }}
        />
      </>
    )
  }

  if (tab === "completed") {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handlePrintInvoice}
        >
          <FileTextIcon className="h-3.5 w-3.5" />
          Cetak Faktur
        </Button>
        {order.shipping?.tracking_number && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={busy}
            onClick={handlePrintLabel}
          >
            <PrinterIcon className="h-3.5 w-3.5" />
            Cetak Resi
          </Button>
        )}
      </>
    )
  }

  if (tab === "empty-stock" || tab === "failed-pick") {
    return (
      <Button
        size="sm"
        className="h-8 gap-1.5 text-xs"
        disabled={busy}
        onClick={() => moveToReady.mutate([order.id])}
      >
        <ArrowRightIcon className="h-3.5 w-3.5" />
        {moveToReady.isPending ? "Memindahkan..." : "Pindahkan ke Perlu Dikirim"}
      </Button>
    )
  }

  if (tab === "cancellation") {
    if (subFilter === "cancelled" || order.status === "cancelled") return null

    return (
      <>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={() => acceptCancel.mutate(order.id)}
        >
          <CheckIcon className="h-3.5 w-3.5" />
          {acceptCancel.isPending ? "Memproses..." : "Terima"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={() => rejectCancel.mutate(order.id)}
        >
          <XIcon className="h-3.5 w-3.5" />
          {rejectCancel.isPending ? "Memproses..." : "Tolak"}
        </Button>
      </>
    )
  }

  if (tab === "returned") {
    if (subFilter === "accepted" || subFilter === "rejected") {
      return (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handlePrintInvoice}
        >
          <FileTextIcon className="h-3.5 w-3.5" />
          Cetak Faktur
        </Button>
      )
    }

    return (
      <>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={() => acceptReturn.mutate(order.id)}
        >
          <CheckIcon className="h-3.5 w-3.5" />
          {acceptReturn.isPending ? "Memproses..." : "Terima"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={() => rejectReturn.mutate({ returnId: order.id })}
        >
          <XIcon className="h-3.5 w-3.5" />
          {rejectReturn.isPending ? "Memproses..." : "Tolak"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handlePrintInvoice}
        >
          <FileTextIcon className="h-3.5 w-3.5" />
          Cetak Faktur
        </Button>
      </>
    )
  }

  if (tab === "all") {
    const secondaryActions: React.ReactNode[] = []
    let primaryAction: React.ReactNode = null

    if (order.shipping?.tracking_number && !order.is_canceled) {
      secondaryActions.push(
        <Button
          key="print-resi"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={handlePrintLabel}
        >
          <PrinterIcon className="h-3.5 w-3.5" />
          Cetak Resi
        </Button>
      )
    }

    if (order.status === "packed" && !order.is_canceled) {
      primaryAction = (
        <Button
          key="ship"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={() => requestAwb.mutate({ orderId: order.id })}
        >
          <TruckIcon className="h-3.5 w-3.5" />
          {requestAwb.isPending ? "Memproses..." : "Kirim"}
        </Button>
      )
    } else if (order.status === "reserved" && !order.is_canceled) {
      primaryAction = (
        <Button
          key="process"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={() => moveToReady.mutate([order.id])}
        >
          <ArrowRightIcon className="h-3.5 w-3.5" />
          {moveToReady.isPending ? "Memproses..." : "Proses Pesanan"}
        </Button>
      )
    }

    return (
      <>
        {secondaryActions}
        {primaryAction}
      </>
    )
  }

  return null
}

function ShipByDeadline({ date }: { date: string }) {
  const deadline = new Date(date)
  if (Number.isNaN(deadline.getTime())) return null

  const now = Date.now()
  const diffMs = deadline.getTime() - now
  const isOverdue = diffMs < 0
  const absDiff = Math.abs(diffMs)

  const totalMinutes = Math.floor(absDiff / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24

  let label: string
  if (days > 0) {
    label = remainingHours > 0 ? `${days}h ${remainingHours}j` : `${days} hari`
  } else if (hours > 0) {
    label = `${hours}j ${minutes}m`
  } else {
    label = `${minutes} menit`
  }

  const colorClass = isOverdue
    ? "text-destructive"
    : hours < 12
      ? "text-amber-600 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-500"

  return (
    <div className="min-w-0">
      <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        Batas Kirim
      </p>
      <div className="flex items-start gap-1 text-sm">
        <ClockIcon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", colorClass)} />
        <div className="min-w-0">
          <p className="font-medium">
            {format(deadline, "dd MMM HH:mm", { locale: idLocale })}
          </p>
          <p className={cn("text-xs font-semibold", colorClass)}>
            {isOverdue ? `Terlambat ${label}` : `${label} lagi`}
          </p>
        </div>
      </div>
    </div>
  )
}

export type OrderCardVariant = "sales" | "outbound-ready"

function OutboundReadyActions({ order }: { order: Order }) {
  const [picklistOpen, setPicklistOpen] = React.useState(false)
  const isMarketplace = !!order.source && order.source !== "manual"

  const handlePrintLabel = () => {
    if (isMarketplace) {
      window.open(
        `/dashboard/document-preview/shipping-label/${order.id}`,
        "_blank",
        "noopener,noreferrer",
      )
    } else {
      toast.info("Cetak label hanya tersedia untuk pesanan marketplace")
    }
  }

  const hasTracking = !!order.shipping?.tracking_number
  const cetakLabelBtn = (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1.5 text-xs"
      disabled={!hasTracking}
      onClick={handlePrintLabel}
    >
      <PrinterIcon className="h-3.5 w-3.5" />
      Cetak Label
    </Button>
  )

  return (
    <>
      {hasTracking ? (
        cetakLabelBtn
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>{cetakLabelBtn}</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            Belum ada AWB dari marketplace, coba beberapa saat lagi atau klik Proses Pesanan ulang untuk request manual
          </TooltipContent>
        </Tooltip>
      )}
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={() => setPicklistOpen(true)}
      >
        <ClipboardListIcon className="h-3.5 w-3.5" />
        Buat Picklist
      </Button>
      <BuatPicklistDialog
        open={picklistOpen}
        onOpenChange={setPicklistOpen}
        orderIds={[order.id]}
        locationId={order.location_id ?? null}
        locationName={order.location_name ?? null}
        multiLocation={false}
        onCreated={() => setPicklistOpen(false)}
      />
    </>
  )
}

export function OrderCard({
  order,
  tab = "all",
  subFilter = null,
  selected,
  onSelectedChange,
  variant = "sales",
}: {
  order: Order
  tab?: OrderTab
  subFilter?: SubFilter
  selected?: boolean
  onSelectedChange?: (v: boolean) => void
  variant?: OrderCardVariant
}) {
  const groupedItems = React.useMemo(() => {
    const map = new Map<string, OrderItem>()
    for (const item of order.items) {
      const key = `${item.channel_product_id ?? ""}|${item.sku}|${item.price}`
      const existing = map.get(key)
      if (existing) {
        map.set(key, {
          ...existing,
          qty_in_base: existing.qty_in_base + item.qty_in_base,
          disc_amount: existing.disc_amount + item.disc_amount,
          tax_amount: existing.tax_amount + item.tax_amount,
          amount: existing.amount + item.amount,
        })
      } else {
        map.set(key, { ...item })
      }
    }
    return Array.from(map.values())
  }, [order.items])

  const statusInfo =
    STATUS_LABELS[order.status] ?? {
      label: order.status,
      className:
        "text-muted-foreground bg-muted border-border",
    }

  return (
    <div
      className={cn(
        "group rounded-xl border border-border/60 bg-card transition-all hover:border-border hover:shadow-sm",
        selected && "border-primary/40 bg-primary/[0.02]"
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border/40 px-4 py-2.5 sm:px-5">
        {onSelectedChange && (
          <Checkbox
            checked={selected}
            onCheckedChange={onSelectedChange}
            className="mr-0.5"
          />
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => copyToClipboard(order.salesorder_no)}
              className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold hover:text-primary transition-colors"
            >
              {order.salesorder_no}
              <CopyIcon className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Klik untuk salin No. Pesanan</TooltipContent>
        </Tooltip>

        {order.channel_order_no && (
          <>
            <span className="text-border select-none">|</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => copyToClipboard(order.channel_order_no!)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="text-[11px] font-medium text-muted-foreground/70">Ref:</span>
                  <span className="font-mono">{order.channel_order_no}</span>
                  <CopyIcon className="h-2.5 w-2.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Klik untuk salin No. Referensi Channel</TooltipContent>
            </Tooltip>
          </>
        )}

        <span className="text-border select-none">|</span>
        <ChannelIcon source={order.source} />
        {order.shop_name && (
          <span className="truncate text-xs text-foreground max-w-[160px]">
            {order.shop_name}
          </span>
        )}

        <div className="ml-auto flex items-center gap-3 text-sm text-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UserIcon className="h-3.5 w-3.5" />
            <span className="max-w-[180px] truncate font-medium text-foreground">
              {order.customer_name || "—"}
            </span>
          </span>
          {order.transaction_date && (
            <>
              <span className="hidden text-border select-none sm:inline">|</span>
              <span className="hidden items-center gap-1.5 sm:inline-flex">
                <CalendarIcon className="h-3.5 w-3.5" />
                {format(
                  new Date(order.transaction_date),
                  "dd MMM yyyy HH:mm",
                  { locale: idLocale }
                )}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 px-4 py-3.5 sm:px-5 lg:flex-row lg:gap-6">
        <div className="flex-1 space-y-2.5 lg:max-w-[360px]">
          {groupedItems.length > 0 ? (
            groupedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              Tidak ada item
            </span>
          )}
        </div>

        <div className={cn(
          "grid flex-1 grid-cols-2 gap-x-6 gap-y-3 lg:items-start",
          order.ship_by_date ? "sm:grid-cols-3 xl:grid-cols-5" : "sm:grid-cols-4"
        )}>
          <div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold whitespace-nowrap",
                statusInfo.className
              )}
            >
              {statusInfo.label}
            </Badge>
            {order.cancel_requested_at && !order.is_canceled && (
              <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                Pembatalan diminta
              </p>
            )}
          </div>

          <div className="min-w-0">
            <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Lokasi Pengambilan
            </p>
            <p className="flex items-start gap-1 text-sm">
              <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="line-clamp-2">{order.location_name || "—"}</span>
            </p>
          </div>

          <div>
            <p className="text-sm font-bold tabular-nums">
              {formatCurrency(order.grand_total)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {order.is_paid
                ? order.payment_method_name || "Dibayar"
                : "Belum dibayar"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Pengiriman
            </p>
            {order.shipping?.provider ? (
              <div className="flex items-start gap-1 text-sm">
                <TruckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-medium">{order.shipping.provider}</p>
                  {order.shipping.tracking_number ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(order.shipping.tracking_number!)
                          }
                          className="mt-1 inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground tabular-nums hover:bg-muted transition-colors"
                        >
                          <span className="text-muted-foreground">AWB:</span>
                          {order.shipping.tracking_number}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Klik untuk salin resi</TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>

          {order.ship_by_date && (
            <ShipByDeadline date={order.ship_by_date} />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-border/40 px-4 py-2 sm:px-5">
        <Button
          variant="link"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          asChild
        >
          <Link href={`/dashboard/pesanan/${order.id}`}>
            <EyeIcon className="h-3.5 w-3.5" />
            Lihat Detail
          </Link>
        </Button>

        <div className="ml-auto flex items-center gap-2">
          {variant === "sales" && (
            <OrderActions order={order} tab={tab} subFilter={subFilter} />
          )}
          {variant === "outbound-ready" && <OutboundReadyActions order={order} />}
        </div>
      </div>
    </div>
  )
}
