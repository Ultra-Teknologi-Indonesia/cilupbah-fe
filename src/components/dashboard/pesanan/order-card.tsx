"use client"

import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import {
  CopyIcon,
  PackageIcon,
  StoreIcon,
  MapPinIcon,
  UserIcon,
  CreditCardIcon,
  TruckIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { type Order, STATUS_LABELS, CHANNEL_MAP } from "@/types/pesanan/order"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.success("Disalin ke clipboard")
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
  const channel = order.source ? CHANNEL_MAP[order.source] : null
  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, className: "text-muted-foreground bg-muted" }

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-border/60 bg-card transition-all hover:border-border hover:shadow-sm",
        selected && "border-primary/40 bg-primary/[0.02]"
      )}
    >
      <div className="flex items-start justify-between gap-2 border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {onSelectedChange && (
            <Checkbox
              checked={selected}
              onCheckedChange={onSelectedChange}
              className="mt-0.5"
            />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => copyToClipboard(order.salesorder_no)}
                className="flex items-center gap-1 font-mono text-sm font-semibold truncate hover:text-primary transition-colors"
              >
                {order.salesorder_no}
                <CopyIcon className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
              </button>
            </div>
            {order.transaction_date && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(order.transaction_date), {
                  addSuffix: true,
                  locale: idLocale,
                })}
              </p>
            )}
          </div>
        </div>
        <Badge variant="outline" className={cn("shrink-0 text-xs font-medium", statusInfo.className)}>
          {statusInfo.label}
        </Badge>
      </div>

      <div className="flex-1 space-y-2.5 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <UserIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate font-medium">{order.customer_name || "—"}</span>
        </div>

        {channel && (
          <div className="flex items-center gap-2 text-sm">
            <StoreIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${channel.color}14`, color: channel.color }}
            >
              {channel.label}
            </span>
          </div>
        )}

        {order.location_name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{order.location_name}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <PackageIcon className="h-3.5 w-3.5 shrink-0" />
          <span>{order.total_sku} SKU &middot; {order.total_qty} item</span>
        </div>

        {order.is_paid && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CreditCardIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs font-medium">
              Dibayar{order.payment_method_name ? ` — ${order.payment_method_name}` : ""}
            </span>
          </div>
        )}

        {order.shipping?.tracking_number && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TruckIcon className="h-3.5 w-3.5 shrink-0" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => copyToClipboard(order.shipping.tracking_number!)}
                  className="font-mono text-xs truncate hover:text-foreground transition-colors"
                >
                  {order.shipping.tracking_number}
                </button>
              </TooltipTrigger>
              <TooltipContent>Klik untuk salin resi</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrency(order.grand_total)}
        </span>
      </div>
    </div>
  )
}
