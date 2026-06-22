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
} from "lucide-react"
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
import { type Order, STATUS_LABELS, CHANNEL_MAP } from "@/types/pesanan/order"

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

function ChannelBadge({ source }: { source: string | null }) {
  if (!source) return null
  const ch = CHANNEL_MAP[source]
  if (!ch) return null
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: `${ch.color}14`, color: ch.color }}
    >
      {ch.label}
    </span>
  )
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
      className: "text-muted-foreground bg-muted",
    }

  const firstItem = order.items[0]
  const remainingCount = order.items.length - 1

  return (
    <div
      className={cn(
        "group rounded-xl border border-border/60 bg-card transition-all hover:border-border hover:shadow-sm",
        selected && "border-primary/40 bg-primary/[0.02]"
      )}
    >
      {/* Header: order meta */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border/40 px-4 py-2.5 sm:px-5">
        {onSelectedChange && (
          <Checkbox
            checked={selected}
            onCheckedChange={onSelectedChange}
            className="mr-1"
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
        <ChannelBadge source={order.source} />

        <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UserIcon className="h-3.5 w-3.5" />
            <span className="max-w-[160px] truncate font-medium text-foreground">
              {order.customer_name || "—"}
            </span>
          </span>
          <span className="hidden text-border select-none sm:inline">|</span>
          {order.transaction_date && (
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <CalendarIcon className="h-3.5 w-3.5" />
              {format(new Date(order.transaction_date), "dd MMM yyyy HH:mm", {
                locale: idLocale,
              })}
            </span>
          )}
        </div>
      </div>

      {/* Body: items + order details grid */}
      <div className="grid grid-cols-1 gap-4 px-4 py-3.5 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-6 sm:px-5">
        {/* Product info */}
        <div className="min-w-0">
          {firstItem ? (
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                <PackageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {firstItem.description || firstItem.sku}
                </p>
                <p className="text-xs text-muted-foreground">
                  SKU: {firstItem.sku}
                  {firstItem.qty_in_base > 1 && (
                    <span className="ml-1.5">x{firstItem.qty_in_base}</span>
                  )}
                </p>
                {remainingCount > 0 && (
                  <p className="mt-0.5 text-xs text-primary/80">
                    +{remainingCount} produk lainnya
                  </p>
                )}
              </div>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Tidak ada item</span>
          )}
        </div>

        {/* Status */}
        <div className="sm:text-center">
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", statusInfo.className)}
          >
            {statusInfo.label}
          </Badge>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground sm:min-w-[140px]">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground/80">Lokasi</p>
            <p className="truncate text-xs">
              {order.location_name || "—"}
            </p>
          </div>
        </div>

        {/* Price + payment */}
        <div className="sm:min-w-[130px] sm:text-right">
          <p className="text-sm font-semibold tabular-nums">
            {formatCurrency(order.grand_total)}
          </p>
          <p className="text-xs text-muted-foreground">
            {order.is_paid
              ? order.payment_method_name || "Dibayar"
              : "Belum dibayar"}
          </p>
        </div>

        {/* Shipping */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground sm:min-w-[130px]">
          <TruckIcon className="h-3.5 w-3.5 shrink-0" />
          <div className="min-w-0">
            {order.shipping?.provider ? (
              <>
                <p className="text-xs font-medium text-foreground/80">
                  {order.shipping.provider}
                </p>
                {order.shipping.tracking_number ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(order.shipping.tracking_number!)
                        }
                        className="font-mono text-xs hover:text-foreground transition-colors"
                      >
                        {order.shipping.tracking_number}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Klik untuk salin resi</TooltipContent>
                  </Tooltip>
                ) : (
                  <p className="text-xs">Belum ada resi</p>
                )}
              </>
            ) : (
              <p className="text-xs">Belum ada kurir</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer: actions */}
      <div className="flex items-center justify-end gap-2 border-t border-border/40 px-4 py-2 sm:px-5">
        <Button variant="link" size="sm" className="h-8 gap-1.5 text-xs" asChild>
          <Link href={`/dashboard/pesanan/${order.id}`} prefetch={false}>
            <EyeIcon className="h-3.5 w-3.5" />
            Lihat Detail
          </Link>
        </Button>
        {order.shipping?.tracking_number && (
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <PrinterIcon className="h-3.5 w-3.5" />
            Cetak Resi
          </Button>
        )}
      </div>
    </div>
  )
}
