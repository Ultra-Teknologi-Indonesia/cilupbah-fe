"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { toast } from "sonner"
import {
  CalendarIcon,
  CheckIcon,
  CopyIcon,
  FileTextIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  PrinterIcon,
  TruckIcon,
  UserIcon,
  XIcon,
  CreditCardIcon,
  MessageSquareIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PageTitle } from "@/components/dashboard/page-title"
import { StatusBadge } from "@/components/dashboard/shared/status-badge"

import { CHANNEL_MAP } from "@/types/pesanan/order"
import { useOrder } from "@/hooks/pesanan/use-orders"
import {
  useSetPaid,
  useMarkComplete,
  useGetShippingLabel,
} from "@/hooks/pesanan/use-order-actions"
import { formatCurrency } from "@/lib/format"


function copyText(text: string) {
  navigator.clipboard.writeText(text)
  toast.success("Disalin ke clipboard")
}

const STEPS = [
  { key: "pending", label: "Dibuat" },
  { key: "reserved", label: "Siap Proses" },
  { key: "picked", label: "Dipick" },
  { key: "packed", label: "Dikemas" },
  { key: "shipped", label: "Dikirim" },
]

function StatusStepper({ status }: { status: string }) {
  const isCancelled = status === "cancelled"
  const currentIdx = STEPS.findIndex((s) => s.key === status)

  return (
    <LiquidGlass
      radius={16}
      intensity="subtle"
      className="bg-white/30 dark:bg-white/[0.04] px-6 py-5"
    >
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const isCompleted = !isCancelled && currentIdx > i
          const isCurrent = !isCancelled && currentIdx === i

          return (
            <React.Fragment key={step.key}>
              {i > 0 && (
                <div
                  className={cn(
                    "h-[2px] flex-1 rounded-full transition-colors",
                    !isCancelled && i <= currentIdx
                      ? "bg-emerald-500"
                      : "bg-border",
                  )}
                />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                    isCompleted &&
                      "border-emerald-500 bg-emerald-500 text-white",
                    isCurrent &&
                      "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25",
                    !isCompleted &&
                      !isCurrent &&
                      "border-muted-foreground/25 bg-background text-muted-foreground/40",
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium whitespace-nowrap",
                    isCompleted && "text-emerald-600 dark:text-emerald-400",
                    isCurrent && "text-primary font-semibold",
                    !isCompleted &&
                      !isCurrent &&
                      "text-muted-foreground/50",
                  )}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          )
        })}

        {isCancelled && (
          <>
            <div className="h-[2px] flex-1 rounded-full bg-rose-300 dark:bg-rose-500/40" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-500/25">
                <XIcon className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                Dibatalkan
              </span>
            </div>
          </>
        )}
      </div>
    </LiquidGlass>
  )
}

function ChannelBadge({ source }: { source: string | null }) {
  if (!source) return null
  const ch = CHANNEL_MAP[source]
  if (!ch) {
    return (
      <Badge variant="outline" className="text-xs capitalize">
        {source}
      </Badge>
    )
  }
  const mask = `url(/channels/${source}.svg) center / contain no-repeat`
  return (
    <span
      className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2"
      style={{ backgroundColor: `${ch.color}12` }}
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

function CopyableText({
  text,
  label,
  mono,
}: {
  text: string
  label: string
  mono?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => copyText(text)}
          className={cn(
            "group/copy inline-flex items-center gap-1.5 text-sm hover:text-primary transition-colors",
            mono && "font-mono",
          )}
        >
          {text}
          <CopyIcon className="h-3 w-3 opacity-0 group-hover/copy:opacity-60 transition-opacity" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-0.5">
          {label}
        </p>
        <div className="text-sm font-medium">{children}</div>
      </div>
    </div>
  )
}

export function OrderDetailView({ orderId }: { orderId: string }) {
  const { data, isLoading } = useOrder(orderId)
  const setPaid = useSetPaid()
  const markComplete = useMarkComplete()
  const getLabel = useGetShippingLabel()

  const order = data?.data

  const isMarketplace = !!order?.source && order.source !== "manual"

  const handlePrintInvoice = () => {
    window.open(`/api/app/sales/${orderId}/invoice`, "_blank")
  }

  const handlePrintLabel = () => {
    if (isMarketplace) {
      window.open(
        `/dashboard/document-preview/shipping-label/${orderId}`,
        "_blank",
        "noopener,noreferrer",
      )
    } else {
      toast.info("Cetak resi hanya tersedia untuk pesanan marketplace")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <PackageIcon className="h-10 w-10" />
        <p className="text-sm">Pesanan tidak ditemukan.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/pesanan">Kembali</Link>
        </Button>
      </div>
    )
  }

  const shippingAddress = [
    order.shipping?.address,
    order.shipping?.city,
    order.shipping?.province,
    order.shipping?.post_code,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title={order.salesorder_no}
        backHref="/dashboard/pesanan"
        breadcrumb={[
          { label: "Pesanan", href: "/dashboard/pesanan" },
          { label: order.salesorder_no },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handlePrintInvoice}
            >
              <FileTextIcon className="h-4 w-4" />
              Cetak Faktur
            </Button>
            {order.shipping?.tracking_number && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handlePrintLabel}
              >
                <PrinterIcon className="h-4 w-4" />
                Cetak Resi
              </Button>
            )}
            {!order.is_paid && !order.is_canceled && (
              <Button
                size="sm"
                className="gap-1.5"
                disabled={setPaid.isPending}
                onClick={() => setPaid.mutate({ orderId: order.id })}
              >
                <CreditCardIcon className="h-4 w-4" />
                {setPaid.isPending ? "Memproses..." : "Tandai Lunas"}
              </Button>
            )}
            <StatusBadge domain="sales-order" status={order.status} className="text-xs font-semibold ml-1" />
          </div>
        }
      />

      <StatusStepper status={order.status} />

      {order.is_canceled && order.cancel_reason && (
        <LiquidGlass
          radius={16}
          intensity="subtle"
          className="border-rose-200 bg-rose-50/50 dark:border-rose-500/20 dark:bg-rose-500/[0.06] px-5 py-3"
        >
          <div className="flex items-start gap-3">
            <XIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-medium text-rose-700 dark:text-rose-400">
                Alasan Pembatalan
              </p>
              <p className="text-sm text-rose-600/80 dark:text-rose-400/70">
                {order.cancel_reason}
              </p>
            </div>
          </div>
        </LiquidGlass>
      )}

      {order.cancel_requested_at && !order.is_canceled && (
        <LiquidGlass
          radius={16}
          intensity="subtle"
          className="border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/[0.06] px-5 py-3"
        >
          <div className="flex items-start gap-3">
            <MessageSquareIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Permintaan Pembatalan
              </p>
              {order.cancel_request_reason && (
                <p className="text-sm text-amber-600/80 dark:text-amber-400/70">
                  {order.cancel_request_reason}
                </p>
              )}
            </div>
          </div>
        </LiquidGlass>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Order Info */}
          <LiquidGlass
            radius={16}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04] p-5"
          >
            <h3 className="mb-4 font-semibold">Informasi Pesanan</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={PackageIcon} label="No. Pesanan">
                <CopyableText
                  text={order.salesorder_no}
                  label="Salin No. Pesanan"
                  mono
                />
              </InfoRow>

              {order.channel_order_no && (
                <InfoRow icon={PackageIcon} label="No. Referensi Channel">
                  <CopyableText
                    text={order.channel_order_no}
                    label="Salin No. Referensi"
                    mono
                  />
                </InfoRow>
              )}

              <InfoRow icon={UserIcon} label="Pelanggan">
                <span>{order.customer_name || "—"}</span>
              </InfoRow>

              <InfoRow icon={CalendarIcon} label="Tanggal Transaksi">
                <span>
                  {order.transaction_date
                    ? format(
                        new Date(order.transaction_date),
                        "dd MMMM yyyy, HH:mm",
                        { locale: idLocale },
                      )
                    : "—"}
                </span>
              </InfoRow>

              {order.source && (
                <InfoRow icon={TruckIcon} label="Sumber">
                  <ChannelBadge source={order.source} />
                  {order.shop_name && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {order.shop_name}
                    </span>
                  )}
                </InfoRow>
              )}

              {order.location_name && (
                <InfoRow icon={MapPinIcon} label="Lokasi Pengambilan">
                  <span>{order.location_name}</span>
                </InfoRow>
              )}
            </div>
          </LiquidGlass>

          {/* Items Table */}
          <LiquidGlass
            radius={16}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04] p-5"
          >
            <h3 className="mb-4 font-semibold">
              Daftar Produk
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({order.items.length} item)
              </span>
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b border-border/60 bg-muted/30">
                    <TableHead className="w-12 whitespace-nowrap text-muted-foreground" />
                    <TableHead className="whitespace-nowrap text-muted-foreground">
                      Produk
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-right text-muted-foreground">
                      Harga
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-center text-muted-foreground">
                      Qty
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-right text-muted-foreground">
                      Diskon
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-right text-muted-foreground">
                      Jumlah
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-border/20 last:border-0"
                    >
                      <TableCell className="px-3 py-2.5">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted/50">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.description || item.sku}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <PackageIcon className="h-4 w-4 opacity-50" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <div className="flex min-w-0 flex-col gap-0.5 max-w-[280px]">
                          <span className="font-medium whitespace-normal break-words">
                            {item.description || "—"}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            SKU: {item.sku}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right tabular-nums">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-center tabular-nums font-medium">
                        {item.qty_in_base}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right tabular-nums">
                        {item.disc > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            {item.disc}%
                            <br />
                            <span className="text-[11px]">
                              -{formatCurrency(item.disc_amount)}
                            </span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right font-medium tabular-nums">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {order.items.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Tidak ada produk.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </LiquidGlass>

          {/* Recipient & Shipping Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Recipient */}
            <LiquidGlass
              radius={16}
              intensity="subtle"
              className="bg-white/30 dark:bg-white/[0.04] p-5"
            >
              <h3 className="mb-4 font-semibold">Penerima</h3>
              <div className="space-y-3">
                <InfoRow icon={UserIcon} label="Nama">
                  <span>
                    {order.shipping?.full_name || order.customer_name || "—"}
                  </span>
                </InfoRow>
                {order.shipping?.phone && (
                  <InfoRow icon={PhoneIcon} label="Telepon">
                    <CopyableText
                      text={order.shipping.phone}
                      label="Salin No. Telepon"
                    />
                  </InfoRow>
                )}
                {shippingAddress && (
                  <InfoRow icon={MapPinIcon} label="Alamat">
                    <span className="whitespace-normal leading-relaxed">
                      {shippingAddress}
                    </span>
                  </InfoRow>
                )}
              </div>
            </LiquidGlass>

            {/* Shipping */}
            <LiquidGlass
              radius={16}
              intensity="subtle"
              className="bg-white/30 dark:bg-white/[0.04] p-5"
            >
              <h3 className="mb-4 font-semibold">Pengiriman</h3>
              <div className="space-y-3">
                <InfoRow icon={TruckIcon} label="Kurir">
                  <span>{order.shipping?.provider || "—"}</span>
                </InfoRow>
                {order.shipping?.tracking_number && (
                  <InfoRow icon={PackageIcon} label="No. Resi">
                    <CopyableText
                      text={order.shipping.tracking_number}
                      label="Salin No. Resi"
                      mono
                    />
                  </InfoRow>
                )}
                {order.received_date && (
                  <InfoRow icon={CalendarIcon} label="Diterima">
                    <span>
                      {format(
                        new Date(order.received_date),
                        "dd MMMM yyyy",
                        { locale: idLocale },
                      )}
                    </span>
                  </InfoRow>
                )}
              </div>
            </LiquidGlass>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Financial Summary */}
          <LiquidGlass
            radius={16}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04] p-5 sticky top-4"
          >
            <h3 className="mb-4 font-semibold">Ringkasan</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Qty</span>
                <span className="font-medium text-foreground">
                  {order.total_qty} item
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Jumlah SKU</span>
                <span className="font-medium text-foreground">
                  {order.total_sku} jenis
                </span>
              </div>

              <div className="my-3 border-t border-border/40" />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  {formatCurrency(order.sub_total)}
                </span>
              </div>
              {order.total_disc > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>Diskon</span>
                  <span className="tabular-nums">
                    -{formatCurrency(order.total_disc)}
                  </span>
                </div>
              )}
              {order.total_tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pajak</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.total_tax)}
                  </span>
                </div>
              )}
              {order.shipping_cost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ongkos Kirim</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.shipping_cost)}
                  </span>
                </div>
              )}
              {order.insurance_cost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asuransi</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.insurance_cost)}
                  </span>
                </div>
              )}

              <div className="border-t border-border/40 pt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span>Grand Total</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.grand_total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment status */}
            <div className="mt-4 border-t border-border/40 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Status Bayar
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold",
                    order.is_paid
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
                  )}
                >
                  {order.is_paid ? "Lunas" : "Belum Dibayar"}
                </Badge>
              </div>
              {order.is_paid && order.payment_method_name && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  via {order.payment_method_name}
                  {order.paid_time &&
                    ` - ${format(new Date(order.paid_time), "dd MMM yyyy HH:mm", { locale: idLocale })}`}
                </p>
              )}
            </div>
          </LiquidGlass>

          {/* Notes */}
          {(order.buyer_message || order.seller_note) && (
            <LiquidGlass
              radius={16}
              intensity="subtle"
              className="bg-white/30 dark:bg-white/[0.04] p-5"
            >
              <h3 className="mb-3 font-semibold">Catatan</h3>
              <div className="space-y-3">
                {order.buyer_message && (
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1">
                      Pesan Pembeli
                    </p>
                    <p className="text-sm leading-relaxed rounded-lg bg-muted/40 px-3 py-2">
                      {order.buyer_message}
                    </p>
                  </div>
                )}
                {order.seller_note && (
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1">
                      Catatan Penjual
                    </p>
                    <p className="text-sm leading-relaxed rounded-lg bg-muted/40 px-3 py-2">
                      {order.seller_note}
                    </p>
                  </div>
                )}
              </div>
            </LiquidGlass>
          )}

          {/* Timestamps */}
          <LiquidGlass
            radius={16}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04] px-5 py-4"
          >
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                Dibuat:{" "}
                {format(new Date(order.created_at), "dd MMM yyyy HH:mm", {
                  locale: idLocale,
                })}
              </p>
              <p>
                Diperbarui:{" "}
                {format(new Date(order.updated_at), "dd MMM yyyy HH:mm", {
                  locale: idLocale,
                })}
              </p>
            </div>
          </LiquidGlass>
        </div>
      </div>
    </div>
  )
}
