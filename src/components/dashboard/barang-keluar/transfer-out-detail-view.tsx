"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, DownloadIcon, PrinterIcon, CheckIcon, TruckIcon, XIcon, Trash2Icon } from "lucide-react"

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
  useOutboundTransferDetail,
  useApproveTransfer,
  useShipTransfer,
  useCancelTransfer,
  useDeleteTransfer,
} from "@/hooks/barang-keluar/use-outbound-transfers"
import { exportCsv } from "@/lib/export-csv"
import { useState, useCallback } from "react"
import { formatDate } from "@/lib/format"

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  APPROVED: "border-indigo-300 text-indigo-600 dark:border-indigo-500/30 dark:text-indigo-400",
  IN_TRANSIT: "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  RECEIVED: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  APPROVED: "Disetujui",
  IN_TRANSIT: "Dikirim",
  RECEIVED: "Diterima",
  CANCELLED: "Dibatalkan",
}

const TIMELINE_STEPS = [
  { key: "DRAFT", label: "Draft" },
  { key: "APPROVED", label: "Disetujui" },
  { key: "IN_TRANSIT", label: "Dikirim" },
  { key: "RECEIVED", label: "Diterima" },
]

const STATUS_ORDER: Record<string, number> = {
  DRAFT: 0,
  APPROVED: 1,
  IN_TRANSIT: 2,
  RECEIVED: 3,
  CANCELLED: -1,
}


function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  )
}

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  if (currentStatus === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 dark:bg-red-500/10">
        <XIcon className="h-4 w-4 text-red-500" />
        <span className="text-sm font-medium text-red-600">Transfer dibatalkan</span>
      </div>
    )
  }

  const currentIdx = STATUS_ORDER[currentStatus] ?? 0

  return (
    <div className="flex items-center gap-0">
      {TIMELINE_STEPS.map((step, idx) => {
        const isDone = idx <= currentIdx
        const isCurrent = idx === currentIdx
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  isDone
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {isDone ? <CheckIcon className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <span className={cn("mt-1 text-[10px] font-medium", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                {step.label}
              </span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div className={cn("mx-1 h-0.5 w-8 sm:w-12", idx < currentIdx ? "bg-emerald-500" : "bg-border")} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function TransferOutDetailView({ transferId }: { transferId: string }) {
  const router = useRouter()
  const { data: transfer, isLoading } = useOutboundTransferDetail(transferId)

  const [approveOpen, setApproveOpen] = useState(false)
  const [approvedBy, setApprovedBy] = useState("")
  const approveMutation = useApproveTransfer()

  const [shipOpen, setShipOpen] = useState(false)
  const [shippedBy, setShippedBy] = useState("")
  const shipMutation = useShipTransfer()

  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelledBy, setCancelledBy] = useState("")
  const cancelMutation = useCancelTransfer()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteMutation = useDeleteTransfer()

  const handleExport = useCallback(() => {
    if (!transfer?.items?.length) return
    exportCsv(
      `transfer-${transfer.transfer_number}.csv`,
      ["SKU", "Nama Produk", "Qty", "Qty Diterima"],
      transfer.items.map((i) => [
        i.variant?.sku ?? "",
        i.variant?.item_name ?? "",
        String(i.qty),
        String(i.received_qty ?? 0),
      ])
    )
  }, [transfer])

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

  if (!transfer) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <p className="text-sm font-medium">Transfer tidak ditemukan</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/barang-keluar")}>
          Kembali
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={transfer.transfer_number}
        description="Detail transfer keluar"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Barang Keluar", href: "/dashboard/barang-keluar" },
          { label: transfer.transfer_number },
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

        {transfer.status === "DRAFT" && (
          <>
            <Button
              size="sm"
              onClick={() => { setApproveOpen(true); setApprovedBy("") }}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <CheckIcon className="mr-1.5 h-4 w-4" />
              Approve
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2Icon className="mr-1.5 h-4 w-4" />
              Hapus
            </Button>
          </>
        )}

        {transfer.status === "APPROVED" && (
          <Button
            size="sm"
            onClick={() => { setShipOpen(true); setShippedBy("") }}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <TruckIcon className="mr-1.5 h-4 w-4" />
            Kirim
          </Button>
        )}

        {(transfer.status === "DRAFT" || transfer.status === "APPROVED") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setCancelOpen(true); setCancelReason(""); setCancelledBy("") }}
            className="text-amber-600 hover:bg-amber-500/10"
          >
            <XIcon className="mr-1.5 h-4 w-4" />
            Batalkan
          </Button>
        )}
      </div>

      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Status Transfer</h3>
          <StatusTimeline currentStatus={transfer.status} />
        </div>
      </LiquidGlass>

      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Informasi Transfer</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
            <InfoRow label="No. Transfer" value={transfer.transfer_number} />
            <InfoRow label="Lokasi Asal" value={transfer.source_location?.location_name} />
            <InfoRow label="Lokasi Tujuan" value={transfer.destination_location?.location_name} />
            <InfoRow
              label="Status"
              value={
                <Badge variant="outline" className={cn("text-[10px] leading-tight", STATUS_STYLE[transfer.status] ?? "")}>
                  {STATUS_LABEL[transfer.status] ?? transfer.status}
                </Badge>
              }
            />
            <InfoRow label="Dibuat oleh" value={transfer.created_by} />
            <InfoRow label="Tgl. Dibuat" value={formatDate(transfer.created_at)} />
            {transfer.approved_by && <InfoRow label="Disetujui oleh" value={transfer.approved_by} />}
            {transfer.approved_at && <InfoRow label="Tgl. Approve" value={formatDate(transfer.approved_at)} />}
            {transfer.assigned_to && <InfoRow label="Petugas" value={transfer.assigned_to} />}
            {transfer.shipped_at && <InfoRow label="Tgl. Kirim" value={formatDate(transfer.shipped_at)} />}
            {transfer.received_by && <InfoRow label="Diterima oleh" value={transfer.received_by} />}
            {transfer.received_at && <InfoRow label="Tgl. Diterima" value={formatDate(transfer.received_at)} />}
            {transfer.notes && <InfoRow label="Catatan" value={transfer.notes} />}
          </div>
        </div>
      </LiquidGlass>

      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Item Transfer</h3>
          {transfer.items?.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    {["SKU", "Nama Produk", "Qty", "Qty Diterima"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transfer.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/20 last:border-0">
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-xs">{item.variant?.sku ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-3">{item.variant?.item_name ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums">{item.qty}</td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{item.received_qty ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada item</p>
          )}
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve Transfer"
        description={`Approve transfer ${transfer.transfer_number}?`}
        confirmLabel="Approve"
        loading={approveMutation.isPending}
        onConfirm={() => {
          if (!approvedBy.trim()) return
          approveMutation.mutate(
            { id: transfer.id, data: { approved_by: approvedBy.trim() } },
            { onSuccess: () => setApproveOpen(false) }
          )
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="detail-approved-by" className="text-sm font-medium">
            Disetujui oleh <span className="text-red-500">*</span>
          </Label>
          <Input
            id="detail-approved-by"
            placeholder="Nama penyetuju"
            value={approvedBy}
            onChange={(e) => setApprovedBy(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={shipOpen}
        onOpenChange={setShipOpen}
        title="Kirim Transfer"
        description={`Kirim transfer ${transfer.transfer_number}? Stok akan dikurangi dari lokasi asal.`}
        confirmLabel="Kirim"
        loading={shipMutation.isPending}
        onConfirm={() => {
          if (!shippedBy.trim()) return
          shipMutation.mutate(
            { id: transfer.id, data: { shipped_by: shippedBy.trim() } },
            { onSuccess: () => setShipOpen(false) }
          )
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="detail-shipped-by" className="text-sm font-medium">
            Dikirim oleh <span className="text-red-500">*</span>
          </Label>
          <Input
            id="detail-shipped-by"
            placeholder="Nama pengirim"
            value={shippedBy}
            onChange={(e) => setShippedBy(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Batalkan Transfer"
        description={`Batalkan transfer ${transfer.transfer_number}?`}
        confirmLabel="Batalkan"
        variant="destructive"
        loading={cancelMutation.isPending}
        onConfirm={() => {
          if (!cancelledBy.trim()) return
          cancelMutation.mutate(
            { id: transfer.id, data: { cancelled_by: cancelledBy.trim(), cancel_reason: cancelReason.trim() || undefined } },
            { onSuccess: () => setCancelOpen(false) }
          )
        }}
      >
        <div className="flex flex-col gap-3 px-1 py-2">
          <div>
            <Label htmlFor="detail-cancelled-by" className="text-sm font-medium">
              Dibatalkan oleh <span className="text-red-500">*</span>
            </Label>
            <Input
              id="detail-cancelled-by"
              placeholder="Nama pembatal"
              value={cancelledBy}
              onChange={(e) => setCancelledBy(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="detail-cancel-reason" className="text-sm font-medium">
              Alasan pembatalan
            </Label>
            <Input
              id="detail-cancel-reason"
              placeholder="Alasan (opsional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Transfer"
        description={`Hapus draft transfer ${transfer.transfer_number}? Aksi ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(transfer.id, {
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
