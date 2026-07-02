"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, CheckCircleIcon, FlagIcon, Loader2Icon, WalletIcon, XCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PageTitle } from "@/components/dashboard/page-title"
import { useSalesReturn } from "@/hooks/barang-masuk/use-sales-returns"
import {
  useAcceptSalesReturn,
  useRejectSalesReturn,
  useCompleteSalesReturn,
} from "@/hooks/barang-masuk/use-sales-return-actions"
import { formatDate } from "@/lib/format"
import type { SalesReturnStatus } from "@/types/barang-masuk/sales-return"

const LIST_HREF = "/dashboard/barang-masuk/retur"

const STATUS_MAP: Record<SalesReturnStatus, { label: string; className: string }> = {
  PENDING: { label: "Menunggu", className: "bg-amber-500/10 text-amber-600" },
  ACCEPTED: { label: "Disetujui", className: "bg-blue-500/10 text-blue-600" },
  REJECTED: { label: "Ditolak", className: "bg-red-500/10 text-red-600" },
  COMPLETED: { label: "Selesai", className: "bg-emerald-500/10 text-emerald-600" },
  CANCELLED: { label: "Dibatalkan", className: "bg-muted text-muted-foreground" },
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  )
}

export function SalesReturnDetailView({ id }: { id: string }) {
  const router = useRouter()
  const { data: ret, isLoading } = useSalesReturn(id)

  const acceptMut = useAcceptSalesReturn()
  const rejectMut = useRejectSalesReturn()
  const completeMut = useCompleteSalesReturn()

  const [action, setAction] = useState<null | "accept" | "reject" | "complete">(null)
  const [processedBy, setProcessedBy] = useState("")
  const [reason, setReason] = useState("")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!ret) {
    return <div className="py-32 text-center text-sm text-muted-foreground">Retur tidak ditemukan.</div>
  }

  const st = STATUS_MAP[ret.status]
  const totalQty = ret.items?.reduce((s, i) => s + i.qty, 0) ?? 0

  const closeAction = () => { setAction(null); setProcessedBy(""); setReason("") }

  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title={ret.return_number}
        backHref={LIST_HREF}
        breadcrumb={[
          { label: "Gudang" },
          { label: "Barang Masuk", href: "/dashboard/barang-masuk" },
          { label: "Retur", href: LIST_HREF },
          { label: ret.return_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(LIST_HREF)}>
              <ArrowLeftIcon className="mr-1.5 h-4 w-4" /> Kembali
            </Button>
            {ret.status === "PENDING" && (
              <>
                <Button size="sm" onClick={() => { closeAction(); setAction("accept") }} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  <CheckCircleIcon className="mr-1.5 h-4 w-4" /> Setujui
                </Button>
                <Button variant="outline" size="sm" onClick={() => { closeAction(); setAction("reject") }} className="text-red-600 hover:bg-red-500/10">
                  <XCircleIcon className="mr-1.5 h-4 w-4" /> Tolak
                </Button>
              </>
            )}
            {ret.status === "ACCEPTED" && (
              <Button size="sm" onClick={() => { closeAction(); setAction("complete") }} className="bg-emerald-600 text-white hover:bg-emerald-700">
                <FlagIcon className="mr-1.5 h-4 w-4" /> Selesaikan
              </Button>
            )}
            {ret.status === "COMPLETED" && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`${LIST_HREF}/${ret.id}/settlement`}>
                  <WalletIcon className="mr-1.5 h-4 w-4" /> Kelola Refund
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-5 py-5 sm:grid-cols-3 lg:grid-cols-4">
          <InfoRow label="Status" value={<Badge variant="secondary" className={cn("text-[11px]", st.className)}>{st.label}</Badge>} />
          <InfoRow label="Sumber" value={ret.source === "marketplace" ? "Marketplace" : "Manual"} />
          <InfoRow label="Pesanan" value={ret.order?.salesorder_no ?? "—"} />
          <InfoRow label="Pelanggan" value={ret.customer_name ?? ret.order?.customer_name ?? "—"} />
          <InfoRow label="Lokasi Restock" value={ret.location?.location_name ?? "—"} />
          <InfoRow label="Total Qty" value={<span className="tabular-nums">{totalQty}</span>} />
          <InfoRow label="Tgl. Dibuat" value={formatDate(ret.created_at)} />
          <InfoRow label="Diproses oleh" value={ret.processed_by ?? "—"} />
          {ret.reason && <InfoRow label="Alasan" value={ret.reason} />}
          {ret.notes && <InfoRow label="Catatan" value={ret.notes} />}
        </div>
      </LiquidGlass>

      <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="px-5 py-5">
          <p className="mb-3 text-sm font-medium">Item Retur</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                  <th className="px-3 py-2.5 font-medium">Produk</th>
                  <th className="px-3 py-2.5 font-medium">SKU</th>
                  <th className="px-3 py-2.5 font-medium">Kondisi</th>
                  <th className="px-3 py-2.5 text-right font-medium">Qty</th>
                </tr>
              </thead>
              <tbody>
                {(ret.items ?? []).length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">Tidak ada item.</td></tr>
                ) : (
                  ret.items.map((it) => (
                    <tr key={it.id} className="border-b border-border/60 last:border-0">
                      <td className="px-3 py-2.5">{it.product?.product?.name ?? it.product?.sku ?? "—"}</td>
                      <td className="px-3 py-2.5 font-mono text-xs">{it.product?.sku ?? "—"}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant="secondary" className="text-[10px]">{it.condition ?? "GOOD"}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{it.qty}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </LiquidGlass>

      {/* Konfirmasi aksi (ringan, 1-2 field) */}
      <ConfirmDialog
        open={action === "accept"}
        onOpenChange={(o) => { if (!o) closeAction() }}
        title="Setujui Retur"
        description={`Setujui retur ${ret.return_number}? Barang akan dijadwalkan masuk kembali ke stok.`}
        confirmLabel="Setujui"
        loading={acceptMut.isPending}
        onConfirm={() => {
          if (!processedBy.trim()) return
          acceptMut.mutate({ id: ret.id, processed_by: processedBy.trim() }, { onSuccess: closeAction })
        }}
      >
        <div className="px-1 py-2">
          <Label className="text-sm font-medium">Diproses oleh <span className="text-red-500">*</span></Label>
          <Input value={processedBy} onChange={(e) => setProcessedBy(e.target.value)} placeholder="Nama petugas" className="mt-1.5" />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={action === "reject"}
        onOpenChange={(o) => { if (!o) closeAction() }}
        title="Tolak Retur"
        description={`Tolak retur ${ret.return_number}?`}
        confirmLabel="Tolak"
        variant="destructive"
        loading={rejectMut.isPending}
        onConfirm={() => {
          if (!processedBy.trim()) return
          rejectMut.mutate({ id: ret.id, processed_by: processedBy.trim(), reason: reason.trim() || undefined }, { onSuccess: closeAction })
        }}
      >
        <div className="flex flex-col gap-3 px-1 py-2">
          <div>
            <Label className="text-sm font-medium">Diproses oleh <span className="text-red-500">*</span></Label>
            <Input value={processedBy} onChange={(e) => setProcessedBy(e.target.value)} placeholder="Nama petugas" className="mt-1.5" />
          </div>
          <div>
            <Label className="text-sm font-medium">Alasan penolakan</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan (opsional)" className="mt-1.5" />
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={action === "complete"}
        onOpenChange={(o) => { if (!o) closeAction() }}
        title="Selesaikan Retur"
        description={`Tandai retur ${ret.return_number} selesai? Pastikan barang sudah diterima kembali ke stok.`}
        confirmLabel="Selesaikan"
        loading={completeMut.isPending}
        onConfirm={() => {
          if (!processedBy.trim()) return
          completeMut.mutate({ id: ret.id, processed_by: processedBy.trim() }, { onSuccess: closeAction })
        }}
      >
        <div className="px-1 py-2">
          <Label className="text-sm font-medium">Diproses oleh <span className="text-red-500">*</span></Label>
          <Input value={processedBy} onChange={(e) => setProcessedBy(e.target.value)} placeholder="Nama petugas" className="mt-1.5" />
        </div>
      </ConfirmDialog>
    </div>
  )
}
