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
  BanIcon,
  CheckCircleIcon,
  PlayIcon,
  AlertTriangleIcon,
  WarehouseIcon,
  ArrowRightIcon,
  FileTextIcon,

  CheckIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Separator } from "@/components/ui/separator"
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
  useCancelOrder,
  useMarkComplete,
  useRequestAwb,
  useMoveToReady,
  useAcceptCancelRequest,
  useRejectCancelRequest,
  useAcceptReturn,
  useRejectReturn,
  useGetShippingLabel,
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
      <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
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
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [completeOpen, setCompleteOpen] = React.useState(false)
  const [relocateOpen, setRelocateOpen] = React.useState(false)

  const cancelOrder = useCancelOrder()
  const markComplete = useMarkComplete()
  const requestAwb = useRequestAwb()
  const moveToReady = useMoveToReady()
  const acceptCancel = useAcceptCancelRequest()
  const rejectCancel = useRejectCancelRequest()
  const acceptReturn = useAcceptReturn()
  const rejectReturn = useRejectReturn()
  const getLabel = useGetShippingLabel()

  const isMarketplace = !!order.source && order.source !== "manual"

  const handlePrintLabel = () => {
    if (isMarketplace) {
      getLabel.mutate({ orderId: order.id })
    } else {
      toast.info("Cetak resi hanya tersedia untuk pesanan marketplace")
    }
  }

  const handlePrintInvoice = () => {
    window.open(`/dashboard/pesanan/${order.id}/invoice`, "_blank")
  }

  const busy =
    cancelOrder.isPending ||
    markComplete.isPending ||
    requestAwb.isPending ||
    moveToReady.isPending ||
    acceptCancel.isPending ||
    rejectCancel.isPending ||
    acceptReturn.isPending ||
    rejectReturn.isPending ||
    getLabel.isPending

  if (tab === "unpaid") return null

  if (tab === "ready-to-process") {
    return (
      <>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={() => requestAwb.mutate({ orderId: order.id })}
        >
          <PlayIcon className="h-3.5 w-3.5" />
          {requestAwb.isPending ? "Memproses..." : "Proses Pesanan"}
        </Button>
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
            {getLabel.isPending ? "Mengambil..." : "Cetak Label"}
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
            {getLabel.isPending ? "Mengambil..." : "Cetak Resi"}
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
            {getLabel.isPending ? "Mengambil..." : "Cetak Resi"}
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
    const actions: React.ReactNode[] = []

    if (order.status === "packed" && !order.is_canceled) {
      actions.push(
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
    }
    if (order.shipping?.tracking_number && !order.is_canceled) {
      actions.push(
        <Button
          key="print-resi"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={handlePrintLabel}
        >
          <PrinterIcon className="h-3.5 w-3.5" />
          {getLabel.isPending ? "Mengambil..." : "Cetak Resi"}
        </Button>
      )
    }

    const showCancel =
      !order.is_canceled &&
      !order.cancel_requested_at &&
      order.status !== "shipped" &&
      order.status !== "cancelled"

    return (
      <>
        {showCancel && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10"
              disabled={busy}
              onClick={() => setCancelOpen(true)}
            >
              <BanIcon className="h-3.5 w-3.5" />
              Batalkan
            </Button>
            {actions.length > 0 && (
              <Separator orientation="vertical" className="!h-5" />
            )}
          </>
        )}
        {actions}

        {showCancel && (
          <ConfirmDialog
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            title="Batalkan pesanan ini?"
            description={`Pesanan ${order.salesorder_no} akan dibatalkan. Stok yang sudah direservasi akan dikembalikan. Tindakan ini tidak dapat dibatalkan.`}
            confirmLabel="Ya, Batalkan Pesanan"
            cancelLabel="Tidak, Kembali"
            variant="destructive"
            onConfirm={() => {
              setCancelOpen(false)
              cancelOrder.mutate({ orderId: order.id })
            }}
          >
            <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-500/20 dark:bg-orange-500/10">
              <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Jika pesanan ini berasal dari marketplace, pembatalan juga akan
                dikirim ke channel terkait.
              </p>
            </div>
          </ConfirmDialog>
        )}
      </>
    )
  }

  return null
}

export function OrderCard({
  order,
  tab = "all",
  subFilter = null,
  selected,
  onSelectedChange,
}: {
  order: Order
  tab?: OrderTab
  subFilter?: SubFilter
  selected?: boolean
  onSelectedChange?: (v: boolean) => void
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

        <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
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

        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:items-start">
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
                          className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          ({order.shipping.tracking_number})
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
          <OrderActions order={order} tab={tab} subFilter={subFilter} />
        </div>
      </div>
    </div>
  )
}
