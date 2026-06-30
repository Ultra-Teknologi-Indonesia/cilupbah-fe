"use client"

import { useParams } from "next/navigation"
import { ArrowLeftIcon, PrinterIcon, DownloadIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { PageTitle } from "@/components/dashboard/page-title"
import { useInboundDetail } from "@/hooks/barang-masuk/use-inbound"
import { exportCsv } from "@/lib/export-csv"
import type { Inbound, InboundItem } from "@/types/barang-masuk/inbound"

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "border-slate-300 text-slate-600",
  PARTIAL: "border-amber-300 text-amber-600",
  RECEIVED: "border-blue-300 text-blue-600",
  PUTAWAY_IN_PROGRESS: "border-indigo-300 text-indigo-600",
  COMPLETED: "border-emerald-300 text-emerald-600",
  CANCELLED: "border-red-300 text-red-600",
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Belum Mulai",
  PARTIAL: "Sebagian",
  RECEIVED: "Selesai Diterima",
  PUTAWAY_IN_PROGRESS: "Sedang Putaway",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
}

const TYPE_LABEL: Record<string, string> = {
  PURCHASE_ORDER: "Pesanan Pembelian",
  TRANSIT_IN: "Transfer Masuk",
  SALES_RETURN: "Retur",
  CONSIGNMENT: "Konsinyasi",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function handleExportCsv(inbound: Inbound) {
  const headers = ["SKU", "Produk", "Qty Diharapkan", "Qty Diterima", "Qty Putaway", "Selisih", "Catatan Selisih"]
  const rows = inbound.items.map((item) => [
    item.variant?.sku ?? "",
    item.variant?.item_name ?? "",
    String(item.expected_qty),
    String(item.received_qty),
    String(item.putaway_qty),
    String(item.discrepancy_qty),
    item.discrepancy_note ?? "",
  ])
  exportCsv(`penerimaan-${inbound.transaction_number}.csv`, headers, rows)
}

export function PenerimaanDetailView({ id }: { id: string }) {
  const { data: inbound, isLoading } = useInboundDetail(id)

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Detail Penerimaan"
        description={inbound ? inbound.transaction_number : "Memuat..."}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Barang Masuk", href: "/dashboard/barang-masuk" },
          { label: "Detail Penerimaan" },
        ]}
      />

      {isLoading ? (
        <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 p-6 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-40 w-full" />
          </div>
        </LiquidGlass>
      ) : !inbound ? (
        <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 p-6 dark:bg-white/[0.04]">
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <p className="text-sm font-medium">Penerimaan tidak ditemukan</p>
            <Link href="/dashboard/barang-masuk">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>
        </LiquidGlass>
      ) : (
        <div className="flex flex-col gap-4 print:gap-2">
          <div className="flex items-center justify-end gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={() => handleExportCsv(inbound)}>
              <DownloadIcon className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <PrinterIcon className="mr-1.5 h-4 w-4" />
              Cetak
            </Button>
          </div>

          <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] print:border print:border-border print:shadow-none">
            <div className="px-5 py-4">
              <h3 className="mb-3 text-sm font-semibold print:text-base">Informasi Penerimaan</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">No. Penerimaan</p>
                  <p className="mt-1 text-sm font-semibold">{inbound.transaction_number}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">No. Referensi</p>
                  <p className="mt-1 text-sm">{inbound.reference_number ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sumber</p>
                  <p className="mt-1 text-sm">{TYPE_LABEL[inbound.type] ?? inbound.type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</p>
                  <Badge variant="outline" className={cn("mt-1 text-[10px]", STATUS_STYLE[inbound.status] ?? "")}>
                    {STATUS_LABEL[inbound.status] ?? inbound.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Lokasi</p>
                  <p className="mt-1 text-sm">{inbound.location?.location_name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tgl. Diharapkan</p>
                  <p className="mt-1 text-sm">{inbound.expected_date ? formatDateShort(inbound.expected_date) : "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Dibuat Oleh</p>
                  <p className="mt-1 text-sm">{inbound.created_by}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Dibuat</p>
                  <p className="mt-1 text-sm">{formatDate(inbound.created_at)}</p>
                </div>
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] print:border print:border-border print:shadow-none">
            <div className="px-5 py-4">
              <h3 className="mb-3 text-sm font-semibold print:text-base">Daftar Item</h3>
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      {["SKU", "Produk", "Qty Diharapkan", "Qty Diterima", "Qty Putaway", "Selisih", "Catatan"].map((h) => (
                        <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inbound.items.map((item: InboundItem) => (
                      <tr key={item.id} className="border-b border-border/20 last:border-0">
                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">{item.variant?.sku ?? "—"}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{item.variant?.item_name ?? "—"}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">{item.expected_qty}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">{item.received_qty}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">{item.putaway_qty}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                          {item.discrepancy_qty !== 0 && (
                            <Badge variant="outline" className="border-red-300 text-[10px] text-red-600">
                              {item.discrepancy_qty > 0 ? "+" : ""}{item.discrepancy_qty}
                            </Badge>
                          )}
                        </td>
                        <td className="max-w-[200px] truncate px-3 py-2.5 text-xs text-muted-foreground">
                          {item.discrepancy_note ?? ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </LiquidGlass>

          {inbound.items.some((i) => i.receipts && i.receipts.length > 0) && (
            <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] print:border print:border-border print:shadow-none">
              <div className="px-5 py-4">
                <h3 className="mb-3 text-sm font-semibold print:text-base">Riwayat Penerimaan</h3>
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/30">
                        {["SKU", "Qty", "Rak", "Batch", "SN", "Kondisi", "Diterima Oleh", "Tanggal"].map((h) => (
                          <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inbound.items.flatMap((item) =>
                        (item.receipts ?? []).map((r) => (
                          <tr key={r.id} className="border-b border-border/20 last:border-0">
                            <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">{item.variant?.sku ?? "—"}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">{r.qty}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{r.bin?.code ?? "—"}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{r.batch_no ?? "—"}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{r.serial_no ?? "—"}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{r.condition ?? "—"}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{r.received_by}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{formatDate(r.received_date)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </LiquidGlass>
          )}

          {inbound.assignments && inbound.assignments.length > 0 && (
            <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] print:border print:border-border print:shadow-none">
              <div className="px-5 py-4">
                <h3 className="mb-3 text-sm font-semibold print:text-base">Riwayat Assignment</h3>
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/30">
                        {["Petugas", "Ditugaskan Oleh", "Status", "Mulai", "Selesai", "Catatan"].map((h) => (
                          <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inbound.assignments.map((a) => (
                        <tr key={a.id} className="border-b border-border/20 last:border-0">
                          <td className="whitespace-nowrap px-3 py-2.5">{a.worker?.name ?? a.assigned_to}</td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{a.assigner?.name ?? a.assigned_by}</td>
                          <td className="whitespace-nowrap px-3 py-2.5">
                            <Badge variant="outline" className={cn("text-[10px]", {
                              "border-slate-300 text-slate-600": a.status === "PENDING",
                              "border-amber-300 text-amber-600": a.status === "IN_PROGRESS",
                              "border-emerald-300 text-emerald-600": a.status === "COMPLETED",
                            })}>
                              {a.status === "PENDING" ? "Menunggu" : a.status === "IN_PROGRESS" ? "Dikerjakan" : "Selesai"}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{a.started_at ? formatDate(a.started_at) : "—"}</td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{a.completed_at ? formatDate(a.completed_at) : "—"}</td>
                          <td className="max-w-[200px] truncate px-3 py-2.5 text-xs text-muted-foreground">{a.notes ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </LiquidGlass>
          )}

          <div className="flex items-center justify-start print:hidden">
            <Link href="/dashboard/barang-masuk">
              <Button variant="outline">
                <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
