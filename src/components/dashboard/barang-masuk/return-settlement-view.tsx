"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { PageTitle } from "@/components/dashboard/page-title"
import { useSalesReturn } from "@/hooks/barang-masuk/use-sales-returns"
import { useSalesReturnSetting } from "@/hooks/barang-masuk/use-sales-return-setting"
import {
  useReturnSettlementForReturn,
  useCreateReturnSettlement,
  useConfirmReturnSettlement,
  useCompleteReturnSettlement,
  useDeleteReturnSettlement,
  useAddRefund,
  useRemoveRefund,
} from "@/hooks/barang-masuk/use-return-settlement"
import type { ReturnSettlementStatus } from "@/types/barang-masuk/return-settlement"

const STATUS_MAP: Record<ReturnSettlementStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground" },
  CONFIRMED: { label: "Dikonfirmasi", className: "bg-blue-500/10 text-blue-600" },
  COMPLETED: { label: "Selesai", className: "bg-emerald-500/10 text-emerald-600" },
}

const DEFAULT_METHODS = ["cash", "transfer", "store_credit"]

function money(v: number | string | null | undefined): string {
  return `Rp ${Number(v ?? 0).toLocaleString("id-ID")}`
}

export function ReturnSettlementView({ returnId }: { returnId: string }) {
  const router = useRouter()
  const backHref = `/dashboard/barang-masuk/retur/${returnId}`

  const { data: ret } = useSalesReturn(returnId)
  const { data: setting } = useSalesReturnSetting()
  const { data: settlement, isLoading } = useReturnSettlementForReturn(returnId)

  const createMut = useCreateReturnSettlement()
  const confirmMut = useConfirmReturnSettlement()
  const completeMut = useCompleteReturnSettlement()
  const deleteMut = useDeleteReturnSettlement()
  const addRefundMut = useAddRefund()
  const removeRefundMut = useRemoveRefund()

  const [refundNo, setRefundNo] = useState("")
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("cash")
  const [refundDate, setRefundDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState("")

  const methodOptions = useMemo(
    () => (setting?.allowed_refund_methods?.length ? setting.allowed_refund_methods : DEFAULT_METHODS)
      .map((m) => ({ value: m, label: m })),
    [setting]
  )

  const isDraft = settlement?.status === "DRAFT"
  const canAddRefund = isDraft && !!refundNo.trim() && Number(amount) > 0 && !!method && !!refundDate

  const handleAddRefund = () => {
    if (!settlement || !canAddRefund) return
    addRefundMut.mutate(
      {
        settlement_id: settlement.id,
        refund_number: refundNo.trim(),
        amount: Number(amount),
        refund_method: method,
        refund_date: refundDate,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => { setRefundNo(""); setAmount(""); setNotes("") },
      }
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title="Settlement Retur"
        backHref={backHref}
        breadcrumb={[
          { label: "Gudang" },
          { label: "Retur", href: "/dashboard/barang-masuk/retur" },
          { label: ret?.return_number ?? "Retur", href: backHref },
          { label: "Settlement" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push(backHref)}>
            <ArrowLeftIcon className="mr-1.5 h-4 w-4" /> Kembali
          </Button>
        }
      />

      {ret && ret.status !== "COMPLETED" ? (
        <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Settlement hanya bisa dibuat untuk retur berstatus <b>Selesai</b>. Selesaikan retur ini dulu.
          </div>
        </LiquidGlass>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2Icon className="size-5 animate-spin" />
        </div>
      ) : !settlement ? (
        <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">Belum ada settlement untuk retur ini.</p>
            <Button
              onClick={() => createMut.mutate({ return_id: returnId })}
              disabled={createMut.isPending}
            >
              {createMut.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Buat Settlement
            </Button>
          </div>
        </LiquidGlass>
      ) : (
        <>
          {/* Header settlement */}
          <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                <div>
                  <div className="text-xs text-muted-foreground">No. Settlement</div>
                  <div className="font-mono text-sm font-semibold">{settlement.settlement_number}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <Badge variant="secondary" className={cn("text-[11px]", STATUS_MAP[settlement.status]?.className)}>
                    {STATUS_MAP[settlement.status]?.label ?? settlement.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-sm font-semibold tabular-nums">{money(settlement.total_amount)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {settlement.status === "DRAFT" && (
                  <>
                    <Button size="sm" onClick={() => confirmMut.mutate(settlement.id)} disabled={confirmMut.isPending}>
                      Konfirmasi
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteMut.mutate(settlement.id, { onSuccess: () => router.push(backHref) })} disabled={deleteMut.isPending}>
                      Hapus
                    </Button>
                  </>
                )}
                {settlement.status === "CONFIRMED" && (
                  <Button size="sm" onClick={() => completeMut.mutate(settlement.id)} disabled={completeMut.isPending}>
                    Selesaikan
                  </Button>
                )}
              </div>
            </div>
          </LiquidGlass>

          {/* Refunds */}
          <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
            <div className="flex flex-col gap-3 px-5 py-5">
              <p className="text-sm font-medium">Refund Tunai</p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                      <th className="px-3 py-2.5 font-medium">No. Refund</th>
                      <th className="px-3 py-2.5 font-medium">Metode</th>
                      <th className="px-3 py-2.5 font-medium">Tanggal</th>
                      <th className="px-3 py-2.5 text-right font-medium">Jumlah</th>
                      {isDraft && <th className="w-10 px-3 py-2.5" />}
                    </tr>
                  </thead>
                  <tbody>
                    {(settlement.refunds ?? []).length === 0 ? (
                      <tr><td colSpan={isDraft ? 5 : 4} className="py-8 text-center text-muted-foreground">Belum ada refund.</td></tr>
                    ) : (
                      settlement.refunds!.map((r) => (
                        <tr key={r.id} className="border-b border-border/60 last:border-0">
                          <td className="px-3 py-2.5 font-mono text-xs">{r.refund_number}</td>
                          <td className="px-3 py-2.5">{r.refund_method}</td>
                          <td className="px-3 py-2.5">{r.refund_date}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{money(r.amount)}</td>
                          {isDraft && (
                            <td className="px-3 py-2.5">
                              <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => removeRefundMut.mutate(r.id)} aria-label="Hapus">
                                <Trash2Icon className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {isDraft && (
                <div className="grid grid-cols-1 items-end gap-2 rounded-lg border border-dashed border-border p-3 sm:grid-cols-[1fr_140px_130px_130px_auto]">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">No. Refund</Label>
                    <Input value={refundNo} onChange={(e) => setRefundNo(e.target.value)} placeholder="REF-001" className="h-9" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Metode</Label>
                    <Combobox options={methodOptions} value={method} onChange={(v) => setMethod(v ?? "cash")} placeholder="Metode" searchPlaceholder="Metode" className="h-9" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Tanggal</Label>
                    <Input type="date" value={refundDate} onChange={(e) => setRefundDate(e.target.value)} className="h-9" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Jumlah</Label>
                    <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="h-9" />
                  </div>
                  <Button size="sm" onClick={handleAddRefund} disabled={!canAddRefund || addRefundMut.isPending} className="gap-1">
                    <PlusIcon className="h-4 w-4" /> Tambah
                  </Button>
                </div>
              )}
            </div>
          </LiquidGlass>

          {/* Invoice deductions (read) */}
          {(settlement.invoices ?? []).length > 0 && (
            <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
              <div className="flex flex-col gap-3 px-5 py-5">
                <p className="text-sm font-medium">Potong Faktur</p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[360px] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                        <th className="px-3 py-2.5 font-medium">Faktur</th>
                        <th className="px-3 py-2.5 text-right font-medium">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlement.invoices!.map((iv) => (
                        <tr key={iv.id} className="border-b border-border/60 last:border-0">
                          <td className="px-3 py-2.5 font-mono text-xs">{iv.invoice?.invoice_number ?? iv.invoice_id}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{money(iv.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </LiquidGlass>
          )}
        </>
      )}
    </div>
  )
}
