"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { XCircleIcon, ShieldIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PageTitle } from "@/components/dashboard/page-title"
import {
  useReservedStockDetail,
  useCancelReservedStock,
} from "@/hooks/transaksi-stok/use-reserved-stocks"

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Aktif",
  CANCELLED: "Dibatalkan",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function getRemainingDays(endDate: string): { label: string; className: string } {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { label: "Kedaluwarsa", className: "text-red-600" }
  return { label: `${diff} hari`, className: diff <= 3 ? "text-amber-600" : "text-foreground" }
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-36 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  )
}

export function CadangDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: stock, isLoading } = useReservedStockDetail(id)
  const cancelMut = useCancelReservedStock()

  const [cancelOpen, setCancelOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!stock) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <ShieldIcon className="h-10 w-10" />
        <p className="text-sm">Dokumen tidak ditemukan.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/transaksi-stok">Kembali</Link>
        </Button>
      </div>
    )
  }

  const isActive = stock.status === "ACTIVE"
  const remaining = getRemainingDays(stock.end_date)

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title={stock.reserved_stock_no}
        backHref="/dashboard/transaksi-stok"
        breadcrumb={[
          { label: "Persediaan" },
          { label: "Transaksi Stok", href: "/dashboard/transaksi-stok" },
          { label: stock.reserved_stock_no },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {isActive && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCancelOpen(true)}
                disabled={cancelMut.isPending}
              >
                <XCircleIcon className="mr-1.5 h-3.5 w-3.5" />
                Batalkan
              </Button>
            )}
          </div>
        }
      />

      <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5">
        <h3 className="mb-4 font-semibold">Informasi Stok Cadang</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label="No. Cadang" value={stock.reserved_stock_no} />
          <InfoRow label="Lokasi" value={stock.location?.location_name} />
          <InfoRow label="Mulai" value={formatDate(stock.start_date)} />
          <InfoRow label="Berakhir" value={formatDate(stock.end_date)} />
          <InfoRow
            label="Status"
            value={
              <Badge variant="outline" className={cn("text-[10px] leading-tight", STATUS_STYLE[stock.status] ?? "")}>
                {STATUS_LABEL[stock.status] ?? stock.status}
              </Badge>
            }
          />
          <InfoRow label="Aktif" value={isActive ? "Ya" : "Tidak"} />
          <InfoRow
            label="Sisa Hari"
            value={
              isActive ? (
                <span className={cn("font-medium", remaining.className)}>{remaining.label}</span>
              ) : "—"
            }
          />
          <InfoRow label="Dibuat Oleh" value={stock.created_by} />
          <InfoRow label="Catatan" value={stock.notes} />
        </div>
      </LiquidGlass>

      <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5">
        <h3 className="mb-4 font-semibold">Daftar Item</h3>
        <div className="overflow-x-auto rounded-lg border border-border/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                {["SKU", "Nama Produk", "Bin", "Qty Dicadangkan"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stock.items ?? []).map((item) => (
                <tr key={item.id} className="border-b border-border/20 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">
                    {item.item?.sku ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {item.item?.item_name ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {item.bin?.code ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums font-medium">
                    {item.qty ?? 0}
                  </td>
                </tr>
              ))}
              {(!stock.items || stock.items.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                    Belum ada item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={(open) => { if (!open) setCancelOpen(false) }}
        title="Batalkan Stok Cadang"
        description={`Batalkan cadang "${stock.reserved_stock_no}"? Stok yang dicadangkan akan dilepas kembali.`}
        confirmLabel="Batalkan"
        variant="destructive"
        loading={cancelMut.isPending}
        onConfirm={() => {
          cancelMut.mutate(stock.id, { onSuccess: () => setCancelOpen(false) })
        }}
      />
    </div>
  )
}
