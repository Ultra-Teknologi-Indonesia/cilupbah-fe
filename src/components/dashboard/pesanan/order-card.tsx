"use client"

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
  CreditCardIcon,
  BanIcon,
  CheckCircleIcon,
  PlayIcon,
  Trash2Icon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  type Order,
  type OrderItem,
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

const CHANNEL_ICONS: Record<string, string> = {
  tiktok: "/channels/tiktok.svg",
  shopee: "/channels/shopee.svg",
  lazada: "/channels/lazada.svg",
  tokopedia: "/channels/tokopedia.svg",
}

function ChannelIcon({ source }: { source: string | null }) {
  if (!source) return null
  const ch = CHANNEL_MAP[source]
  const icon = source ? CHANNEL_ICONS[source] : null
  if (!ch) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${ch.color}14` }}
        >
          {icon ? (
            <Image
              src={icon}
              alt={ch.label}
              width={16}
              height={16}
              className="h-4 w-4 object-contain"
            />
          ) : (
            <span
              className="text-[10px] font-bold"
              style={{ color: ch.color }}
            >
              {ch.label.slice(0, 2)}
            </span>
          )}
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
}: {
  order: Order
}) {
  const actions: React.ReactNode[] = []

  if (!order.is_paid && !order.is_canceled && order.status === "pending") {
    actions.push(
      <Button key="pay" size="sm" className="h-8 gap-1.5 text-xs">
        <CreditCardIcon className="h-3.5 w-3.5" />
        Tandai Dibayar
      </Button>
    )
  }

  if (
    order.is_paid &&
    !order.is_canceled &&
    (order.status === "pending" || order.status === "reserved")
  ) {
    actions.push(
      <Button key="process" size="sm" className="h-8 gap-1.5 text-xs">
        <PlayIcon className="h-3.5 w-3.5" />
        Proses Pesanan
      </Button>
    )
  }

  if (order.status === "packed" && !order.is_canceled) {
    actions.push(
      <Button key="ship" size="sm" className="h-8 gap-1.5 text-xs">
        <TruckIcon className="h-3.5 w-3.5" />
        Kirim
      </Button>
    )
  }

  if (order.shipping?.tracking_number && !order.is_canceled) {
    actions.push(
      <Button
        key="print"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
      >
        <PrinterIcon className="h-3.5 w-3.5" />
        Cetak Resi
      </Button>
    )
  }

  if (order.cancel_requested_at && !order.is_canceled) {
    actions.push(
      <Button
        key="accept-cancel"
        variant="destructive"
        size="sm"
        className="h-8 gap-1.5 text-xs"
      >
        <BanIcon className="h-3.5 w-3.5" />
        Terima Pembatalan
      </Button>
    )
  }

  if (order.status === "shipped" && !order.is_canceled) {
    actions.push(
      <Button
        key="complete"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
      >
        <CheckCircleIcon className="h-3.5 w-3.5" />
        Selesai
      </Button>
    )
  }

  if (order.is_canceled) {
    actions.push(
      <Button
        key="delete"
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
      >
        <Trash2Icon className="h-3.5 w-3.5" />
        Hapus
      </Button>
    )
  }

  if (
    !order.is_canceled &&
    !order.cancel_requested_at &&
    order.status !== "shipped" &&
    order.status !== "cancelled"
  ) {
    actions.push(
      <Button
        key="cancel"
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
      >
        <BanIcon className="h-3.5 w-3.5" />
        Batalkan
      </Button>
    )
  }

  return <>{actions}</>
}

export function OrderCard({
  order,
  selected,
  onSelectedChange,
}: {
  order: Order
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
      {/* ── Header ── */}
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
              No Pesanan: {order.salesorder_no}
              <CopyIcon className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Klik untuk salin</TooltipContent>
        </Tooltip>

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

      {/* ── Body: items row + details columns ── */}
      <div className="flex flex-col gap-4 px-4 py-3.5 sm:px-5 lg:flex-row lg:gap-6">
        {/* Left: all items */}
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

        {/* Right: status + location + price + shipping — horizontal on lg */}
        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:items-start">
          {/* Status */}
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

          {/* Location */}
          <div className="min-w-0">
            <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Lokasi Pengambilan
            </p>
            <p className="flex items-start gap-1 text-sm">
              <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="line-clamp-2">{order.location_name || "—"}</span>
            </p>
          </div>

          {/* Price + payment */}
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

          {/* Shipping */}
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

      {/* ── Footer: actions ── */}
      <div className="flex items-center justify-end gap-2 border-t border-border/40 px-4 py-2 sm:px-5">
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

        <OrderActions order={order} />
      </div>
    </div>
  )
}
