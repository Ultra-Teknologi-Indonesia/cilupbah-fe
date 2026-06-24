"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  PencilIcon,
  Trash2Icon,
  ReceiptIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  usePurchaseBillDetail,
  useDeletePurchaseBill,
} from "@/hooks/transaksi-pembelian/use-purchase-bills"
import type { PurchaseBillStatus } from "@/types/transaksi-pembelian/purchase-bill"

const STATUS_STYLE: Record<PurchaseBillStatus, string> = {
  DRAFT: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  OPEN: "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  PARTIAL: "border-amber-300 text-amber-600 dark:border-amber-500/30 dark:text-amber-400",
  PAID: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<PurchaseBillStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  PARTIAL: "Dibayar Sebagian",
  PAID: "Lunas",
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

export function TagihanDetailView({ id }: { id: string }) {
  const router = useRouter()
  const { data: bill, isLoading } = usePurchaseBillDetail(id)
  const deleteMut = useDeletePurchaseBill()

  const [showDelete, setShowDelete] = useState(false)

  function handleDelete() {
    if (!bill) return
    deleteMut.mutate(bill.id, {
      onSuccess: () => {
        setShowDelete(false)
        router.push("/dashboard/transaksi-pembelian/tagihan")
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <ReceiptIcon className="h-10 w-10" />
        <p className="text-sm">Tagihan tidak ditemukan.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/transaksi-pembelian/tagihan">Kembali</Link>
        </Button>
      </div>
    )
  }

  const isDraft = bill.status === "DRAFT"
  const remaining = bill.total_amount - bill.paid_amount

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/transaksi-pembelian/tagihan">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">{bill.bill_number}</h1>
          <Badge variant="outline" className={cn("text-xs", STATUS_STYLE[bill.status])}>
            {STATUS_LABEL[bill.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isDraft && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/transaksi-pembelian/tagihan/${bill.id}/edit`}>
                  <PencilIcon className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)} disabled={deleteMut.isPending}>
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
            <h3 className="mb-4 font-semibold">Informasi Tagihan</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Pemasok" value={bill.contact?.name} />
              <DetailRow label="Lokasi" value={bill.location?.location_name} />
              <DetailRow label="Tanggal Tagihan" value={formatDate(bill.bill_date)} />
              <DetailRow label="Jatuh Tempo" value={bill.due_date ? formatDate(bill.due_date) : null} />
              <DetailRow label="No. Referensi" value={bill.ref_no} />
              <DetailRow label="Termin" value={bill.payment_term ? `${bill.payment_term} hari` : null} />
              <DetailRow label="Tag" value={bill.tag} />
              <DetailRow
                label="Pesanan Terkait"
                value={
                  bill.purchase_order ? (
                    <Link href={`/dashboard/transaksi-pembelian/pesanan/${bill.purchase_order.id}`} className="text-primary hover:underline">
                      {bill.purchase_order.po_number}
                    </Link>
                  ) : null
                }
              />
              <DetailRow label="Keterangan" value={bill.notes} />
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
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Diskon</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/20 last:border-0">
                      <td className="px-3 py-2.5">
                        <div className="font-medium">{item.product?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{item.product?.sku}</div>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatCurrency(item.unit_price)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{item.qty}</td>
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
                <span className="font-medium">{bill.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatCurrency(bill.sub_total)}</span>
              </div>
              {bill.total_disc > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Diskon</span>
                  <span className="tabular-nums">-{formatCurrency(bill.total_disc)}</span>
                </div>
              )}
              {bill.total_tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pajak</span>
                  <span className="tabular-nums">{formatCurrency(bill.total_tax)}</span>
                </div>
              )}
              <div className="border-t border-border/40 pt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(bill.total_amount)}</span>
                </div>
              </div>

              <div className="border-t border-border/40 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dibayar</span>
                  <span className="tabular-nums">{formatCurrency(bill.paid_amount)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Sisa</span>
                  <span className={cn("tabular-nums", remaining > 0 ? "text-amber-600" : "text-emerald-600")}>
                    {formatCurrency(remaining)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-border/40 pt-4 text-xs text-muted-foreground">
              <p>Dibuat oleh: {bill.created_by}</p>
              <p>Pada: {formatDate(bill.created_at)}</p>
            </div>
          </LiquidGlass>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={(v) => !v && setShowDelete(false)}
        title="Hapus Tagihan"
        description={`Apakah Anda yakin ingin menghapus tagihan "${bill.bill_number}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
