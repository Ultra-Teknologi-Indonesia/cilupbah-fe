"use client"

import { useState, useRef, useCallback } from "react"
import {
  UploadIcon,
  FileSpreadsheetIcon,
  CheckCircle2Icon,
  XCircleIcon,
  SaveIcon,
  AlertTriangleIcon,
  FileDownIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useValidateImport, useSaveImport } from "@/hooks/kontak-pemasok/use-contact-import"
import { ContactImportService } from "@/services/kontak-pemasok/contact-import.service"
import type { ImportValidateResult, ImportValidRow, ImportInvalidRow } from "@/types/kontak-pemasok/import"

type ViewTab = "valid" | "invalid"

const COLUMNS = [
  "Nama", "Tipe", "PKP/Non PKP", "NPWP", "NIK", "Kategori",
  "Termin", "No. Telepon", "Email", "Detail Alamat",
  "Provinsi", "Kota", "Kecamatan", "Kelurahan",
] as const

interface ImportPemasokDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportPemasokDialog({ open, onOpenChange }: ImportPemasokDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportValidateResult | null>(null)
  const [tab, setTab] = useState<ViewTab>("valid")
  const [saved, setSaved] = useState(false)

  const validateMut = useValidateImport()
  const saveMut = useSaveImport()

  const handleReset = useCallback(() => {
    setFile(null)
    setResult(null)
    setSaved(false)
    if (fileRef.current) fileRef.current.value = ""
  }, [])

  const handleClose = useCallback((v: boolean) => {
    if (!v) handleReset()
    onOpenChange(v)
  }, [onOpenChange, handleReset])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setSaved(false)
  }, [])

  const handleImport = useCallback(() => {
    if (!file) return
    validateMut.mutate(file, {
      onSuccess: (data) => {
        setResult(data)
        setTab(data.invalid_count > 0 ? "invalid" : "valid")
      },
    })
  }, [file, validateMut])

  const handleSave = useCallback(() => {
    if (!result || result.valid_count === 0) return
    saveMut.mutate(result.valid, {
      onSuccess: () => setSaved(true),
    })
  }, [result, saveMut])

  const showUploadStep = !result

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "flex max-h-[90vh] flex-col gap-0 p-0",
        result ? "max-w-6xl" : "max-w-lg"
      )}>
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>Import</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1" style={{ maxHeight: "calc(90vh - 73px)" }}>
          <div className="flex flex-col gap-4 p-6">
            {showUploadStep && (
              <>
                {/* File input */}
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors cursor-pointer",
                    file
                      ? "border-primary/40 bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                  onClick={() => fileRef.current?.click()}
                  role="button"
                  tabIndex={0}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className={cn(
                    "flex-1 text-sm truncate",
                    file ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {file ? file.name : "Pilih file yang akan di import"}
                  </span>
                  <UploadIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>

                {/* Description */}
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Import menggunakan file *.xlsx yang diexport dari excel.
                    <br />
                    Dengan melakukan import kontak, data kontak baru akan ditambahkan sesuai dengan data dari file yang Anda unggah.
                  </p>
                  <p>
                    Untuk mempermudah pengisian data, gunakan template yang telah kami sediakan :
                  </p>
                </div>

                {/* Template download link */}
                <button
                  type="button"
                  onClick={() => ContactImportService.downloadTemplate()}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline w-fit"
                >
                  <FileDownIcon className="h-4 w-4" />
                  Template Kontak
                </button>
              </>
            )}

            {/* Results */}
            {result && (
              <>
                {/* Summary */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border/40 p-3">
                    <p className="text-xs text-muted-foreground">Total Baris</p>
                    <p className="text-xl font-bold tabular-nums">{result.total}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-500" />
                      <p className="text-xs text-muted-foreground">Valid</p>
                    </div>
                    <p className="text-xl font-bold tabular-nums text-emerald-600">{result.valid_count}</p>
                  </div>
                  <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 dark:border-red-500/20 dark:bg-red-500/5">
                    <div className="flex items-center gap-1.5">
                      <XCircleIcon className="h-3.5 w-3.5 text-red-500" />
                      <p className="text-xs text-muted-foreground">Tidak Valid</p>
                    </div>
                    <p className="text-xl font-bold tabular-nums text-red-600">{result.invalid_count}</p>
                  </div>
                </div>

                {/* Tabs + save button */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setTab("valid")}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                        tab === "valid"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      Valid ({result.valid_count})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("invalid")}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                        tab === "invalid"
                          ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      Tidak Valid ({result.invalid_count})
                    </button>
                  </div>

                  {!saved && result.valid_count > 0 && (
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saveMut.isPending}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {saveMut.isPending ? (
                        <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <SaveIcon className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      {saveMut.isPending ? "Menyimpan..." : `Simpan ${result.valid_count} Data Valid`}
                    </Button>
                  )}

                  {saved && (
                    <Badge className="border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400">
                      <CheckCircle2Icon className="mr-1 h-3 w-3" />
                      Berhasil Disimpan
                    </Badge>
                  )}
                </div>

                {tab === "invalid" && result.invalid_count > 0 && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                    <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>Baris yang tidak valid tidak akan disimpan. Perbaiki data di Excel lalu upload ulang.</span>
                  </div>
                )}

                {/* Table */}
                <ScrollArea className="rounded-lg border border-border/40">
                  <div className="min-w-max">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                          <th className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            #
                          </th>
                          {COLUMNS.map((h) => (
                            <th key={h} className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                              {h}
                            </th>
                          ))}
                          {tab === "invalid" && (
                            <th className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                              Error
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {tab === "valid" && result.valid.map((item) => (
                          <ValidRow key={item.row} item={item} />
                        ))}
                        {tab === "invalid" && result.invalid.map((item) => (
                          <InvalidRow key={item.row} item={item} />
                        ))}
                        {((tab === "valid" && result.valid_count === 0) ||
                          (tab === "invalid" && result.invalid_count === 0)) && (
                          <tr>
                            <td
                              colSpan={COLUMNS.length + 2}
                              className="px-3 py-8 text-center text-muted-foreground text-sm"
                            >
                              Tidak ada data.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer with Import button */}
        {showUploadStep && (
          <div className="shrink-0 border-t px-6 py-4 flex justify-end">
            <Button
              onClick={handleImport}
              disabled={!file || validateMut.isPending}
            >
              {validateMut.isPending ? (
                <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <FileSpreadsheetIcon className="mr-1.5 h-3.5 w-3.5" />
              )}
              {validateMut.isPending ? "Memproses..." : "Import"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ValidRow({ item }: { item: ImportValidRow }) {
  return (
    <tr className="border-b border-border/20 last:border-0">
      <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">{item.row}</td>
      {COLUMNS.map((col) => (
        <td key={col} className="whitespace-nowrap px-3 py-2 text-xs">
          {item.raw[col as keyof typeof item.raw] || "—"}
        </td>
      ))}
    </tr>
  )
}

function InvalidRow({ item }: { item: ImportInvalidRow }) {
  return (
    <tr className="border-b border-border/20 bg-red-50/50 last:border-0 dark:bg-red-500/5">
      <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">{item.row}</td>
      {COLUMNS.map((col) => (
        <td key={col} className="whitespace-nowrap px-3 py-2 text-xs">
          {item.raw[col as keyof typeof item.raw] || "—"}
        </td>
      ))}
      <td className="px-3 py-2">
        <div className="flex flex-col gap-0.5">
          {item.errors.map((err, i) => (
            <span key={i} className="whitespace-nowrap text-[11px] text-red-600 dark:text-red-400">
              {err}
            </span>
          ))}
        </div>
      </td>
    </tr>
  )
}
