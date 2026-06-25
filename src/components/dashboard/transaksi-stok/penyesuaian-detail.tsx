"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  DownloadIcon,
  CheckCircle2Icon,
  Trash2Icon,
  ClipboardListIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PageTitle } from "@/components/dashboard/page-title"
import {
  useStockAdjustmentDetail,
  useApproveStockAdjustment,
  useDeleteStockAdjustment,
} from "@/hooks/transaksi-stok/use-stock-adjustments"
import { exportCsv } from "@/lib/export-csv"

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  APPROVED: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  APPROVED: "Disetujui",
  CANCELLED: "Dibatalkan",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-36 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  )
}

export function PenyesuaianDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: adj, isLoading } = useStockAdjustmentDetail(id)
  const approveMut = useApproveStockAdjustment()
  const deleteMut = useDeleteStockAdjustment()

  const [approveOpen, setApproveOpen] = useState(false)
  const [approvedBy, setApprovedBy] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)

  const actionPending = approveMut.isPending || deleteMut.isPending

  const handleExport = () => {
    if (!adj || !adj.items?.length) return
    exportCsv(
      `penyesuaian-${adj.adjustment_no}.csv`,
      ["SKU", "Nama Produk", "Bin", "Batch", "Serial", "Stok Sistem", "Stok Aktual", "Selisih", "Catatan"],
      adj.items.map((item) => [
        item.item?.sku ?? "",
        item.item?.item_name ?? "",
        item.bin?.code ?? "",
        item.batch_no ?? "",
        item.serial_no ?? "",
        String(item.system_qty ?? 0),
        String(item.actual_qty ?? 0),
        String((item.actual_qty ?? 0) - (item.system_qty ?? 0)),
        item.notes ?? "",
      ])
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

  if (!adj) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <ClipboardListIcon className="h-10 w-10" />
        <p className="text-sm">Dokumen tidak ditemukan.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/transaksi-stok">Kembali</Link>
        </Button>
      </div>
    )
  }

  const isDraft = adj.status === "DRAFT"

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title={adj.adjustment_no}
        backHref="/dashboard/transaksi-stok"
        breadcrumb={[
          { label: "Persediaan" },
          { label: "Transaksi Stok", href: "/dashboard/transaksi-stok" },
          { label: adj.adjustment_no },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!adj.items?.length}>
              <DownloadIcon className="mr-1.5 h-3.5 w-3.5" />
              Export CSV
            </Button>
            {isDraft && (
              <>
                <Button
                  size="sm"
                  onClick={() => { setApproveOpen(true); setApprovedBy("") }}
                  disabled={actionPending}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <CheckCircle2Icon className="mr-1.5 h-3.5 w-3.5" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                  disabled={actionPending}
                >
                  <Trash2Icon className="mr-1.5 h-3.5 w-3.5" />
                  Hapus
                </Button>
              </>
            )}
          </div>
        }
      />

      <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5">
        <h3 className="mb-4 font-semibold">Informasi Penyesuaian</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label="No. Penyesuaian" value={adj.adjustment_no} />
          <InfoRow label="Lokasi" value={adj.location?.location_name} />
          <InfoRow label="Tgl. Transaksi" value={adj.transaction_date ? formatDate(adj.transaction_date) : null} />
          <InfoRow
            label="Status"
            value={
              <Badge variant="outline" className={cn("text-[10px] leading-tight", STATUS_STYLE[adj.status] ?? "")}>
                {STATUS_LABEL[adj.status] ?? adj.status}
              </Badge>
            }
          />
          <InfoRow label="Dibuat Oleh" value={adj.created_by} />
          <InfoRow label="Disetujui Oleh" value={adj.approved_by} />
          <InfoRow label="Catatan" value={adj.notes} />
          <InfoRow label="Saldo Awal" value={adj.is_beginning_balance ? "Ya" : "Tidak"} />
        </div>
      </LiquidGlass>

      <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5">
        <h3 className="mb-4 font-semibold">Daftar Item</h3>
        <div className="overflow-x-auto rounded-lg border border-border/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                {["SKU", "Nama Produk", "Bin", "Batch", "Serial", "Stok Sistem", "Stok Aktual", "Selisih", "Catatan"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(adj.items ?? []).map((item) => {
                const diff = (item.actual_qty ?? 0) - (item.system_qty ?? 0)
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
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                      {item.batch_no ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                      {item.serial_no ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                      {item.system_qty ?? 0}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                      {item.actual_qty ?? 0}
                    </td>
                    <td className={cn(
                      "whitespace-nowrap px-3 py-2.5 text-right tabular-nums font-medium",
                      diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-600" : "text-muted-foreground"
                    )}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                      {item.notes ?? "—"}
                    </td>
                  </tr>
                )
              })}
              {(!adj.items || adj.items.length === 0) && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">
                    Belum ada item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={(open) => { if (!open) setApproveOpen(false) }}
        title="Approve Penyesuaian"
        description={`Approve penyesuaian "${adj.adjustment_no}"? Stok akan disesuaikan sesuai dokumen.`}
        confirmLabel="Approve"
        loading={approveMut.isPending}
        onConfirm={() => {
          if (!approvedBy.trim()) return
          approveMut.mutate(
            { id: adj.id, approvedBy: approvedBy.trim() },
            { onSuccess: () => setApproveOpen(false) }
          )
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="adj-approved-by" className="text-sm font-medium">
            Disetujui oleh <span className="text-red-500">*</span>
          </Label>
          <Input
            id="adj-approved-by"
            placeholder="Nama penanggung jawab"
            value={approvedBy}
            onChange={(e) => setApprovedBy(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => { if (!open) setDeleteOpen(false) }}
        title="Hapus Penyesuaian"
        description={`Hapus penyesuaian "${adj.adjustment_no}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={() => {
          deleteMut.mutate(adj.id, {
            onSuccess: () => {
              setDeleteOpen(false)
              router.push("/dashboard/transaksi-stok")
            },
          })
        }}
      />
    </div>
  )
}
