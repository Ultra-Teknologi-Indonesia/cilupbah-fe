"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, DownloadIcon, PrinterIcon, PlayIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PageTitle } from "@/components/dashboard/page-title"
import { usePurchaseReturnDetail, useProcessPurchaseReturn, useDeletePurchaseReturn } from "@/hooks/barang-keluar/use-purchase-returns"
import { exportCsv } from "@/lib/export-csv"
import { useState, useCallback } from "react"

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  SUBMITTED: "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  APPROVED: "border-indigo-300 text-indigo-600 dark:border-indigo-500/30 dark:text-indigo-400",
  COMPLETED: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Diajukan",
  APPROVED: "Disetujui",
  COMPLETED: "Selesai",
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
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  )
}

export default function ReturPembelianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const { data: retur, isLoading } = usePurchaseReturnDetail(id)

  const [processOpen, setProcessOpen] = useState(false)
  const [processedBy, setProcessedBy] = useState("")
  const processMutation = useProcessPurchaseReturn()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteMutation = useDeletePurchaseReturn()

  const handleExport = useCallback(() => {
    if (!retur?.items?.length) return
    exportCsv(
      `retur-${retur.return_number}.csv`,
      ["SKU", "Nama Produk", "Qty", "Harga Satuan", "Subtotal", "Kondisi", "Catatan"],
      retur.items.map((i) => [
        i.product?.sku ?? "",
        i.product?.name ?? "",
        String(i.qty),
        String(i.unit_price),
        String(i.subtotal),
        i.condition,
        i.notes ?? "",
      ])
    )
  }, [retur])

  const handlePrint = useCallback(() => window.print(), [])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!retur) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <p className="text-sm font-medium">Retur tidak ditemukan</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/barang-keluar")}>
          Kembali
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={retur.return_number}
        description="Detail retur pembelian"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Barang Keluar", href: "/dashboard/barang-keluar" },
          { label: retur.return_number },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/barang-keluar")}>
          <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
          Kembali
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <DownloadIcon className="mr-1.5 h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="outline" size="sm" className="print:hidden" onClick={handlePrint}>
          <PrinterIcon className="mr-1.5 h-4 w-4" />
          Print
        </Button>
        {retur.status === "DRAFT" && (
          <>
            <Button
              size="sm"
              onClick={() => { setProcessOpen(true); setProcessedBy("") }}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <PlayIcon className="mr-1.5 h-4 w-4" />
              Proses Retur
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2Icon className="mr-1.5 h-4 w-4" />
              Hapus
            </Button>
          </>
        )}
      </div>

      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Informasi Retur</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
            <InfoRow label="No. Retur" value={retur.return_number} />
            <InfoRow label="Pemasok" value={retur.supplier?.name} />
            <InfoRow label="Lokasi" value={retur.location?.location_name} />
            <InfoRow label="Tgl. Retur" value={formatDate(retur.return_date)} />
            <InfoRow label="Total" value={formatCurrency(retur.total_amount)} />
            <InfoRow
              label="Status"
              value={
                <Badge variant="outline" className={cn("text-[10px] leading-tight", STATUS_STYLE[retur.status] ?? "")}>
                  {STATUS_LABEL[retur.status] ?? retur.status}
                </Badge>
              }
            />
            <InfoRow label="Dibuat oleh" value={retur.created_by} />
            <InfoRow label="Tgl. Dibuat" value={formatDate(retur.created_at)} />
            {retur.processed_by && <InfoRow label="Diproses oleh" value={retur.processed_by} />}
            {retur.processed_at && <InfoRow label="Tgl. Proses" value={formatDate(retur.processed_at)} />}
            {retur.reason && <InfoRow label="Alasan" value={retur.reason} />}
            {retur.notes && <InfoRow label="Catatan" value={retur.notes} />}
            {retur.purchaseOrder && <InfoRow label="No. PO" value={retur.purchaseOrder.po_number} />}
          </div>
        </div>
      </LiquidGlass>

      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Item Retur</h3>
          {retur.items?.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    {["SKU", "Nama Produk", "Qty", "Harga Satuan", "Subtotal", "Kondisi", "Catatan"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {retur.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/20 last:border-0">
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-xs">{item.product?.sku ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-3">{item.product?.name ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums">{item.qty}</td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{formatCurrency(item.unit_price)}</td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums font-medium">{formatCurrency(item.subtotal)}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <Badge variant="outline" className="text-[10px]">{item.condition}</Badge>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{item.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border/40 bg-muted/20">
                    <td colSpan={4} className="px-3 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Total</td>
                    <td className="whitespace-nowrap px-3 py-3 tabular-nums font-semibold">{formatCurrency(retur.total_amount)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada item</p>
          )}
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={processOpen}
        onOpenChange={setProcessOpen}
        title="Proses Retur Pembelian"
        description={`Proses retur ${retur.return_number}? Stok akan dikurangi sesuai item retur.`}
        confirmLabel="Proses"
        loading={processMutation.isPending}
        onConfirm={() => {
          if (!processedBy.trim()) return
          processMutation.mutate(
            { id: retur.id, data: { processed_by: processedBy.trim() } },
            { onSuccess: () => setProcessOpen(false) }
          )
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="detail-processed-by" className="text-sm font-medium">
            Diproses oleh <span className="text-red-500">*</span>
          </Label>
          <Input
            id="detail-processed-by"
            placeholder="Nama penanggung jawab"
            value={processedBy}
            onChange={(e) => setProcessedBy(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Retur"
        description={`Hapus retur ${retur.return_number}? Aksi ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(retur.id, {
            onSuccess: () => {
              setDeleteOpen(false)
              router.push("/dashboard/barang-keluar")
            },
          })
        }}
      />

      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          nav, header, aside, footer { display: none !important; }
        }
      `}</style>
    </div>
  )
}
