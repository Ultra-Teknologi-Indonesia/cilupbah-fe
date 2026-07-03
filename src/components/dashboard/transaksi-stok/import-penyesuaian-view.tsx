"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  DownloadIcon,
  FileSpreadsheetIcon,
  Loader2Icon,
  UploadCloudIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { PageTitle } from "@/components/dashboard/page-title"
import { UserSelect } from "@/components/dashboard/shared/user-select"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import {
  usePreviewStockAdjustmentImport,
  useConfirmStockAdjustmentImport,
} from "@/hooks/transaksi-stok/use-stock-adjustment-import"
import { StockAdjustmentImportService } from "@/services/transaksi-stok/stock-adjustment-import.service"
import type {
  ImportPreviewResponse,
  ImportPreviewError,
  ImportPreviewWarning,
} from "@/types/transaksi-stok/stock-adjustment-import"

const LIST_HREF = "/dashboard/transaksi-stok?tab=penyesuaian"

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function ImportPenyesuaianView() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [locationId, setLocationId] = useState("")
  const [transactionDate, setTransactionDate] = useState(todayStr)
  const [adjustmentNo, setAdjustmentNo] = useState("[auto]")
  const [notes, setNotes] = useState("")
  const [createdBy, setCreatedBy] = useState("")
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null)

  const { data: locData } = useLocations({ perPage: 100 })
  const previewMut = usePreviewStockAdjustmentImport()
  const confirmMut = useConfirmStockAdjustmentImport()

  const locationOptions = useMemo(
    () =>
      (locData?.items ?? [])
        .filter((l) => {
          const name = (l.locationName ?? "").toLowerCase()
          return !name.includes("transit") && !name.includes("virtual")
        })
        .map((l) => ({ value: l.id, label: l.locationName })),
    [locData]
  )

  const handlePickFile = (f: File | null) => {
    setFile(f)
    setPreview(null)
  }

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) handlePickFile(f)
  }

  const handlePreview = () => {
    if (!file || !locationId) return
    previewMut.mutate(
      { file, locationId },
      {
        onSuccess: (res) => setPreview(res.data),
      }
    )
  }

  const handleConfirm = () => {
    if (!preview || !createdBy.trim()) return
    confirmMut.mutate(
      {
        preview_token: preview.token,
        transaction_date: transactionDate,
        created_by: createdBy.trim(),
        notes: notes.trim() || undefined,
        adjustment_no:
          adjustmentNo.trim() === "" || adjustmentNo.trim() === "[auto]"
            ? undefined
            : adjustmentNo.trim(),
      },
      { onSuccess: () => router.push(LIST_HREF) }
    )
  }

  const canPreview = !!file && !!locationId && !previewMut.isPending
  const canConfirm =
    !!preview &&
    preview.items.length > 0 &&
    preview.errors.length === 0 &&
    !!createdBy.trim() &&
    !confirmMut.isPending

  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title="Import Penyesuaian Stok"
        backHref={LIST_HREF}
        breadcrumb={[
          { label: "Persediaan" },
          { label: "Transaksi Stok", href: LIST_HREF },
          { label: "Import Penyesuaian Stok" },
        ]}
      />

      {/* Header form */}
      <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">No. Penyesuaian</Label>
              <Input
                value={adjustmentNo}
                onChange={(e) => setAdjustmentNo(e.target.value)}
                onFocus={(e) => {
                  if (e.target.value === "[auto]") setAdjustmentNo("")
                }}
                onBlur={(e) => {
                  if (e.target.value.trim() === "") setAdjustmentNo("[auto]")
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Lokasi <span className="text-red-500">*</span>
              </Label>
              <Combobox
                options={locationOptions}
                value={locationId}
                onChange={(v) => {
                  setLocationId(v ?? "")
                  setPreview(null)
                }}
                placeholder="Pilih lokasi…"
                searchPlaceholder="Cari lokasi…"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Keterangan</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alasan koreksi (opsional)"
              rows={2}
            />
          </div>
          <div className="sr-only" aria-hidden="true">
            <UserSelect value={createdBy} onChange={setCreatedBy} defaultToSelf />
          </div>
        </div>
      </LiquidGlass>

      {/* Upload + template */}
      <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Label className="text-sm font-medium">Template Import</Label>
              <p className="text-xs text-muted-foreground">
                Isi salah satu <span className="font-mono">delta_qty</span> (selisih) atau{" "}
                <span className="font-mono">final_qty</span> (stok akhir) per baris.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => StockAdjustmentImportService.downloadTemplate()}
              className="gap-1.5"
            >
              <DownloadIcon className="h-4 w-4" /> Download Template
            </Button>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropFile}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-center transition-colors hover:border-primary/50 hover:bg-primary/[0.03]",
              !locationId && "opacity-60"
            )}
          >
            <UploadCloudIcon className="h-8 w-8 text-muted-foreground/50" />
            {file ? (
              <>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB — klik untuk ganti file
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">Klik atau drag file .xlsx di sini</p>
                <p className="text-xs text-muted-foreground">
                  {locationId
                    ? "Maksimal 1000 baris"
                    : "Pilih lokasi dulu di atas untuk mulai upload"}
                </p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              disabled={!locationId}
              onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handlePreview}
              disabled={!canPreview}
              className="gap-1.5"
            >
              {previewMut.isPending && (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              )}
              <FileSpreadsheetIcon className="h-4 w-4" /> Preview Import
            </Button>
          </div>
        </div>
      </LiquidGlass>

      {/* Preview panel */}
      {preview && (
        <PreviewPanel
          preview={preview}
          onConfirm={handleConfirm}
          canConfirm={canConfirm}
          confirming={confirmMut.isPending}
          onCancel={() => router.push(LIST_HREF)}
        />
      )}
    </div>
  )
}

function PreviewPanel({
  preview,
  onConfirm,
  canConfirm,
  confirming,
  onCancel,
}: {
  preview: ImportPreviewResponse
  onConfirm: () => void
  canConfirm: boolean
  confirming: boolean
  onCancel: () => void
}) {
  const summary = preview.summary
  const hasErrors = preview.errors.length > 0

  return (
    <>
      <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-col gap-4 px-5 py-5">
          {/* Summary badges */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard label="Total Baris" value={summary.total_rows} />
            <SummaryCard label="Valid" value={summary.valid} tone="ok" />
            <SummaryCard label="Error" value={summary.errors} tone="err" />
            <SummaryCard label="Warning" value={summary.warnings} tone="warn" />
          </div>

          {/* Error + warning list */}
          {(preview.errors.length > 0 || preview.warnings.length > 0) && (
            <div className="flex flex-col gap-2">
              {preview.errors.map((e: ImportPreviewError, i) => (
                <div
                  key={`e${i}`}
                  className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
                >
                  <span className="font-mono">Baris {e.row}</span> · {e.field}: {e.error}
                </div>
              ))}
              {preview.warnings.map((w: ImportPreviewWarning, i) => (
                <div
                  key={`w${i}`}
                  className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400"
                >
                  <span className="font-mono">Baris {w.row}</span> · {w.field}: {w.warning}
                </div>
              ))}
            </div>
          )}

          {/* Preview table */}
          {preview.items.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium">#</th>
                    <th className="px-3 py-2.5 text-left font-medium">SKU / Produk</th>
                    <th className="px-3 py-2.5 text-left font-medium">Rak</th>
                    <th className="px-3 py-2.5 text-left font-medium">Mode</th>
                    <th className="px-3 py-2.5 text-right font-medium">Input</th>
                    <th className="px-3 py-2.5 text-right font-medium">On Hand</th>
                    <th className="px-3 py-2.5 text-right font-medium">Qty Akhir</th>
                    <th className="px-3 py-2.5 text-right font-medium">Selisih</th>
                    <th className="px-3 py-2.5 text-right font-medium">Harga Pokok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.items.map((it) => (
                    <tr key={it.row_no} className="bg-background/50">
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                        {it.row_no}
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium">{it.product_name || it.sku}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{it.sku}</p>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{it.bin_code}</td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium",
                            it.mode === "DELTA"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                              : "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                          )}
                        >
                          {it.mode}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {it.input_value > 0 ? `+${it.input_value}` : it.input_value}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                        {it.system_qty}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">
                        {it.actual_qty}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right font-mono tabular-nums",
                          it.difference > 0 && "text-emerald-600 dark:text-emerald-400",
                          it.difference < 0 && "text-red-600 dark:text-red-400"
                        )}
                      >
                        {it.difference > 0 ? `+${it.difference}` : it.difference}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {it.unit_cost != null ? it.unit_cost.toLocaleString("id-ID") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </LiquidGlass>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button onClick={onConfirm} disabled={!canConfirm}>
          {confirming && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          {hasErrors
            ? `Perbaiki ${preview.errors.length} error dulu`
            : `Konfirmasi Import (${preview.items.length} item)`}
        </Button>
      </div>
    </>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: "ok" | "err" | "warn"
}) {
  return (
    <div className="rounded-lg border border-border bg-background/50 px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-xl font-semibold tabular-nums",
          tone === "ok" && "text-emerald-600 dark:text-emerald-400",
          tone === "err" && "text-destructive",
          tone === "warn" && "text-amber-600 dark:text-amber-400"
        )}
      >
        {value}
      </p>
    </div>
  )
}
