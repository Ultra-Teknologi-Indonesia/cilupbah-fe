"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckCircle2Icon,
  XCircleIcon,
  Trash2Icon,
  PackageIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  usePurchaseOrderDetail,
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
  useDeletePurchaseOrder,
} from "@/hooks/transaksi-pembelian/use-purchase-orders"
import type { PurchaseOrderStatus } from "@/types/transaksi-pembelian/purchase-order"

const STATUS_STYLE: Record<PurchaseOrderStatus, string> = {
  DRAFT: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  OPEN: "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  PARTIAL_RECEIVED: "border-amber-300 text-amber-600 dark:border-amber-500/30 dark:text-amber-400",
  FULLY_RECEIVED: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  PARTIAL_RECEIVED: "Diterima Sebagian",
  FULLY_RECEIVED: "Diterima Penuh",
  CANCELLED: "Dibatalkan",
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-36 shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  )
}

export function PesananDetailView({ id }: { id: string }) {
  const router = useRouter()
  const { data: po, isLoading } = usePurchaseOrderDetail(id)
  const approveMut = useApprovePurchaseOrder()
  const cancelMut = useCancelPurchaseOrder()
  const deleteMut = useDeletePurchaseOrder()

  const [confirmAction, setConfirmAction] = useState<"approve" | "cancel" | "delete" | null>(null)

  function handleConfirm() {
    if (!po || !confirmAction) return
    const opts = {
      onSuccess: () => {
        setConfirmAction(null)
        if (confirmAction === "delete") router.push("/dashboard/transaksi-pembelian")
      },
    }
    if (confirmAction === "approve") approveMut.mutate(po.id, opts)
    else if (confirmAction === "cancel") cancelMut.mutate(po.id, opts)
    else deleteMut.mutate(po.id, opts)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!po) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <PackageIcon className="h-10 w-10" />
        <p className="text-sm">Pesanan tidak ditemukan.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/transaksi-pembelian">Kembali</Link>
        </Button>
      </div>
    )
  }

  const isDraft = po.status === "DRAFT"
  const actionPending = approveMut.isPending || cancelMut.isPending || deleteMut.isPending

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/transaksi-pembelian">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">{po.po_number}</h1>
          <Badge variant="outline" className={cn("text-xs", STATUS_STYLE[po.status])}>
            {STATUS_LABEL[po.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isDraft && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/transaksi-pembelian/pesanan/${po.id}/edit`}>
                  <PencilIcon className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
              <Button variant="primary" size="sm" onClick={() => setConfirmAction("approve")} disabled={actionPending}>
                <CheckCircle2Icon className="mr-1.5 h-3.5 w-3.5" />
                Approve
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmAction("cancel")} disabled={actionPending}>
                <XCircleIcon className="mr-1.5 h-3.5 w-3.5" />
                Batalkan
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setConfirmAction("delete")} disabled={actionPending}>
                <Trash2Icon className="mr-1.5 h-3.5 w-3.5" />
                Hapus
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5">
            <h3 className="mb-4 font-semibold">Informasi Pesanan</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Pemasok" value={po.contact?.name} />
              <DetailRow label="Lokasi" value={po.location?.location_name} />
              <DetailRow label="Tanggal Pesanan" value={formatDate(po.order_date)} />
              <DetailRow label="No. Referensi" value={po.ref_no} />
              <DetailRow label="Termin Pembayaran" value={po.payment_term ? `${po.payment_term} hari` : null} />
              <DetailRow label="Keterangan" value={po.notes} />
            </div>
          </LiquidGlass>

          <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5">
            <h3 className="mb-4 font-semibold">Daftar Produk</h3>
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Produk</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Harga</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Qty</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Diterima</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Diskon</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {po.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/20 last:border-0">
                      <td className="px-3 py-2.5">
                        <div className="font-medium">{item.product?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{item.product?.sku}</div>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatCurrency(item.unit_price)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{item.qty}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        <span className={cn(item.received_qty >= item.qty ? "text-emerald-600" : item.received_qty > 0 ? "text-amber-600" : "text-muted-foreground")}>
                          {item.received_qty}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {item.disc > 0 ? `${item.disc}%` : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LiquidGlass>
        </div>

        <div className="flex flex-col gap-4">
          <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5 sticky top-4">
            <h3 className="mb-4 font-semibold">Rincian</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jumlah Produk</span>
                <span className="font-medium">{po.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatCurrency(po.sub_total)}</span>
              </div>
              {po.total_disc > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Diskon</span>
                  <span className="tabular-nums">-{formatCurrency(po.total_disc)}</span>
                </div>
              )}
              {po.total_tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pajak</span>
                  <span className="tabular-nums">{formatCurrency(po.total_tax)}</span>
                </div>
              )}
              <div className="border-t border-border/40 pt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(po.total_amount)}</span>
                </div>
              </div>
            </div>

            {po.bills && po.bills.length > 0 && (
              <div className="mt-5 border-t border-border/40 pt-4">
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Tagihan Terkait</h4>
                <div className="space-y-1">
                  {po.bills.map((b) => (
                    <Link key={b.id} href={`/dashboard/transaksi-pembelian/tagihan/${b.id}`} className="block text-sm font-medium text-primary hover:underline">
                      {b.bill_number}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 border-t border-border/40 pt-4 text-xs text-muted-foreground">
              <p>Dibuat oleh: {po.created_by}</p>
              <p>Pada: {formatDate(po.created_at)}</p>
            </div>
          </LiquidGlass>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(v) => !v && setConfirmAction(null)}
        title={
          confirmAction === "approve" ? "Approve Pesanan"
          : confirmAction === "cancel" ? "Batalkan Pesanan"
          : "Hapus Pesanan"
        }
        description={
          confirmAction === "approve"
            ? `Approve pesanan "${po.po_number}"? Status akan berubah menjadi Open.`
            : confirmAction === "cancel"
            ? `Batalkan pesanan "${po.po_number}"? Tindakan ini tidak dapat dibatalkan.`
            : `Hapus pesanan "${po.po_number}"? Tindakan ini tidak dapat dibatalkan.`
        }
        confirmLabel={confirmAction === "approve" ? "Approve" : confirmAction === "cancel" ? "Batalkan" : "Hapus"}
        variant={confirmAction === "approve" ? "default" : "destructive"}
        loading={actionPending}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
