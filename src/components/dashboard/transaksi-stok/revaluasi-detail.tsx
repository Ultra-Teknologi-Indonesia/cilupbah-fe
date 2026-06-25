"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DownloadIcon, XCircleIcon, DollarSignIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PageTitle } from "@/components/dashboard/page-title"
import {
  useStockRevaluationDetail,
  useCancelStockRevaluation,
} from "@/hooks/transaksi-stok/use-stock-revaluations"
import { exportCsv } from "@/lib/export-csv"

const STATUS_STYLE: Record<string, string> = {
  APPROVED: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Disetujui",
  CANCELLED: "Dibatalkan",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-36 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  )
}

export function RevaluasiDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: reval, isLoading } = useStockRevaluationDetail(id)
  const cancelMut = useCancelStockRevaluation()

  const [cancelOpen, setCancelOpen] = useState(false)

  const handleExport = () => {
    if (!reval || !reval.items?.length) return
    exportCsv(
      `revaluasi-${reval.revaluation_no}.csv`,
      ["SKU", "Nama Produk", "Bin", "Qty", "HPP Lama", "HPP Baru", "Selisih"],
      reval.items.map((item) => {
        const diff = (item.new_cost ?? 0) - (item.old_cost ?? 0)
        return [
          item.item?.sku ?? "",
          item.item?.item_name ?? "",
          item.bin?.code ?? "",
          String(item.qty ?? 0),
          String(item.old_cost ?? 0),
          String(item.new_cost ?? 0),
          String(diff),
        ]
      })
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!reval) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <DollarSignIcon className="h-10 w-10" />
        <p className="text-sm">Dokumen tidak ditemukan.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/transaksi-stok">Kembali</Link>
        </Button>
      </div>
    )
  }

  const isApproved = reval.status === "APPROVED"

  const totalSelisih = (reval.items ?? []).reduce((sum, item) => {
    return sum + ((item.new_cost ?? 0) - (item.old_cost ?? 0)) * (item.qty ?? 0)
  }, 0)

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title={reval.revaluation_no}
        backHref="/dashboard/transaksi-stok"
        breadcrumb={[
          { label: "Persediaan" },
          { label: "Transaksi Stok", href: "/dashboard/transaksi-stok" },
          { label: reval.revaluation_no },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!reval.items?.length}>
              <DownloadIcon className="mr-1.5 h-3.5 w-3.5" />
              Export CSV
            </Button>
            {isApproved && (
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
        <h3 className="mb-4 font-semibold">Informasi Revaluasi</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label="No. Revaluasi" value={reval.revaluation_no} />
          <InfoRow label="Lokasi" value={reval.location?.location_name} />
          <InfoRow
            label="Status"
            value={
              <Badge variant="outline" className={cn("text-[10px] leading-tight", STATUS_STYLE[reval.status] ?? "")}>
                {STATUS_LABEL[reval.status] ?? reval.status}
              </Badge>
            }
          />
          <InfoRow label="Dibuat Oleh" value={reval.created_by} />
          <InfoRow label="Disetujui Oleh" value={reval.approved_by} />
          <InfoRow label="Tgl. Dibuat" value={reval.created_at ? formatDate(reval.created_at) : null} />
          <InfoRow label="Catatan" value={reval.notes} />
        </div>
      </LiquidGlass>

      <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5">
        <h3 className="mb-4 font-semibold">Daftar Item</h3>
        <div className="overflow-x-auto rounded-lg border border-border/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                {["SKU", "Nama Produk", "Bin", "Qty", "HPP Lama", "HPP Baru", "Selisih"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(reval.items ?? []).map((item) => {
                const diff = (item.new_cost ?? 0) - (item.old_cost ?? 0)
                return (
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
                    <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                      {item.qty ?? 0}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                      {formatCurrency(item.old_cost ?? 0)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                      {formatCurrency(item.new_cost ?? 0)}
                    </td>
                    <td className={cn(
                      "whitespace-nowrap px-3 py-2.5 text-right tabular-nums font-medium",
                      diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-600" : "text-muted-foreground"
                    )}>
                      {diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
                    </td>
                  </tr>
                )
              })}
              {(!reval.items || reval.items.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                    Belum ada item.
                  </td>
                </tr>
              )}
            </tbody>
            {reval.items && reval.items.length > 0 && (
              <tfoot>
                <tr className="border-t border-border/60 bg-muted/20">
                  <td colSpan={6} className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Selisih
                  </td>
                  <td className={cn(
                    "whitespace-nowrap px-3 py-2.5 text-right tabular-nums font-semibold",
                    totalSelisih > 0 ? "text-emerald-600" : totalSelisih < 0 ? "text-red-600" : "text-muted-foreground"
                  )}>
                    {totalSelisih > 0 ? `+${formatCurrency(totalSelisih)}` : formatCurrency(totalSelisih)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={(open) => { if (!open) setCancelOpen(false) }}
        title="Batalkan Revaluasi"
        description={`Batalkan revaluasi "${reval.revaluation_no}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Batalkan"
        variant="destructive"
        loading={cancelMut.isPending}
        onConfirm={() => {
          cancelMut.mutate(reval.id, { onSuccess: () => setCancelOpen(false) })
        }}
      />
    </div>
  )
}
