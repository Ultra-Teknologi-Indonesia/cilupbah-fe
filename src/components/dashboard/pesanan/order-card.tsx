"use client"

import * as React from "react"
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
  TagIcon,
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <PackageIcon className="h-5 w-5 text-muted-foreground/60" />
      </div>
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
  const placeholder = (label: string) => () => toast.info(`${label} akan segera tersedia`)

  if (tab === "unpaid") return null

  if (tab === "ready-to-process") {
    return (
      <>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Proses Pesanan")}>
          <PlayIcon className="h-3.5 w-3.5" />
          Proses Pesanan
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Edit Gudang")}>
          <WarehouseIcon className="h-3.5 w-3.5" />
          Edit Gudang
        </Button>
        {!order.shipping?.tracking_number && (
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Atur Pengiriman")}>
            <TruckIcon className="h-3.5 w-3.5" />
            Atur Pengiriman
          </Button>
        )}
        {order.shipping?.tracking_number && (
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Cetak Label")}>
            <PrinterIcon className="h-3.5 w-3.5" />
            Cetak Label
          </Button>
        )}
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Selesaikan")}>
          <CheckCircleIcon className="h-3.5 w-3.5" />
          Selesaikan
        </Button>
      </>
    )
  }

  if (tab === "in-transit") {
    return (
      <>
        {order.shipping?.tracking_number && (
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Cetak Resi")}>
            <PrinterIcon className="h-3.5 w-3.5" />
            Cetak Resi
          </Button>
        )}
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Selesaikan")}>
          <CheckCircleIcon className="h-3.5 w-3.5" />
          Selesaikan
        </Button>
      </>
    )
  }

  if (tab === "completed") {
    return (
      <>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Cetak Faktur")}>
          <FileTextIcon className="h-3.5 w-3.5" />
          Cetak Faktur
        </Button>
        {order.shipping?.tracking_number && (
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Cetak Resi")}>
            <PrinterIcon className="h-3.5 w-3.5" />
            Cetak Resi
          </Button>
        )}
      </>
    )
  }

  if (tab === "empty-stock" || tab === "failed-pick") {
    return (
      <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Pindahkan ke Perlu Dikirim")}>
        <ArrowRightIcon className="h-3.5 w-3.5" />
        Pindahkan ke Perlu Dikirim
      </Button>
    )
  }

  if (tab === "cancellation") {
    if (subFilter === "cancelled" || order.status === "cancelled") return null

    return (
      <>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Terima Pembatalan")}>
          <CheckIcon className="h-3.5 w-3.5" />
          Terima
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Tolak Pembatalan")}>
          <XIcon className="h-3.5 w-3.5" />
          Tolak
        </Button>
      </>
    )
  }

  if (tab === "returned") {
    if (subFilter === "accepted" || subFilter === "rejected") {
      return (
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Cetak Faktur")}>
          <FileTextIcon className="h-3.5 w-3.5" />
          Cetak Faktur
        </Button>
      )
    }

    return (
      <>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Terima Retur")}>
          <CheckIcon className="h-3.5 w-3.5" />
          Terima
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Tolak Retur")}>
          <XIcon className="h-3.5 w-3.5" />
          Tolak
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Cetak Faktur")}>
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
        <Button key="ship" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Kirim")}>
          <TruckIcon className="h-3.5 w-3.5" />
          Kirim
        </Button>
      )
    }
    if (order.shipping?.tracking_number && !order.is_canceled) {
      actions.push(
        <Button key="print-resi" variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={placeholder("Cetak Resi")}>
          <PrinterIcon className="h-3.5 w-3.5" />
          Cetak Resi
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
              toast.info("Fitur pembatalan akan segera tersedia")
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
          {order.items.length > 0 ? (
            order.items.map((item) => (
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
          <Link href={`/dashboard/pesanan/${order.id}`} prefetch={false}>
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
