"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ImageIcon,
  Loader2Icon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  useAdjustmentDetail,
  useApplyAdjustment,
  useCancelAdjustment,
  useDeleteAdjustment,
} from "@/hooks/harga/use-adjustments"

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  applied: { label: "Diterapkan", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  cancelled: { label: "Dibatalkan", className: "bg-destructive/10 text-destructive" },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? STATUS_LABEL.draft
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  )
}

function fmtDate(iso: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

const formatIDR = (value: number | null) =>
  value === null
    ? "—"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(value)

export function PenyesuaianDetailView({ id }: { id: string }) {
  const router = useRouter()
  const { data: detail, isLoading } = useAdjustmentDetail(id)
  const applyMutation = useApplyAdjustment()
  const cancelMutation = useCancelAdjustment()
  const deleteMutation = useDeleteAdjustment()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-muted-foreground">
        <p>Penyesuaian tidak ditemukan</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/harga/penyesuaian">Kembali</Link>
        </Button>
      </div>
    )
  }

  const isDraft = detail.status === "draft"

  return (
    <div className="flex flex-col gap-6">
      <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeftIcon className="size-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{detail.adjustmentNo}</h2>
                <StatusBadge status={detail.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {fmtDate(detail.adjustmentDate)} · {detail.type === "online" ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {isDraft && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={applyMutation.isPending}
                onClick={() => applyMutation.mutate(id)}
              >
                {applyMutation.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2Icon className="size-4" />
                )}
                Terapkan
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(id)}
              >
                <XCircleIcon className="size-4" />
                Batal
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={deleteMutation.isPending}
                onClick={() =>
                  deleteMutation.mutate(id, {
                    onSuccess: () => router.push("/dashboard/harga/penyesuaian"),
                  })
                }
              >
                <Trash2Icon className="size-4" />
                Hapus
              </Button>
            </div>
          )}
        </div>

        {detail.notes && (
          <div className="border-b border-border/30 px-5 py-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Keterangan:</span> {detail.notes}
            </p>
          </div>
        )}

        <div className="grid gap-4 border-b border-border/30 px-5 py-3 text-sm sm:grid-cols-3">
          <div>
            <span className="text-muted-foreground">Dibuat oleh</span>
            <p className="font-medium">{detail.createdBy ?? "—"}</p>
          </div>
          {detail.appliedBy && (
            <div>
              <span className="text-muted-foreground">Diterapkan oleh</span>
              <p className="font-medium">{detail.appliedBy}</p>
            </div>
          )}
          {detail.appliedAt && (
            <div>
              <span className="text-muted-foreground">Diterapkan pada</span>
              <p className="font-medium">{fmtDate(detail.appliedAt)}</p>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produk</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Target</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Harga Lama</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Harga Baru</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Selisih</th>
              </tr>
            </thead>
            <tbody>
              {detail.items.map((item) => {
                const diff = item.newPrice - item.oldPrice
                return (
                  <tr key={item.id} className="border-b border-border/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                          {item.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.thumbnail} alt={item.productName} className="size-full object-cover" />
                          ) : (
                            <ImageIcon className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{item.productName}</div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="font-mono">{item.sku}</span>
                            {item.variationValues.length > 0 && (
                              <>
                                <span>·</span>
                                <span>{item.variationValues.join(" / ")}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.targetName}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatIDR(item.oldPrice)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{formatIDR(item.newPrice)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span
                        className={
                          diff > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : diff < 0
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }
                      >
                        {diff > 0 ? "+" : ""}
                        {formatIDR(diff)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 text-sm text-muted-foreground">
          Total {detail.items.length} item
        </div>
      </LiquidGlass>
    </div>
  )
}
