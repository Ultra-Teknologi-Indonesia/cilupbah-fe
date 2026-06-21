"use client"

import * as React from "react"
import { DownloadIcon, FileSpreadsheetIcon, Loader2Icon, UploadIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useImportFile } from "@/hooks/master-produk/use-import"
import { ImportService, type ImportBatchType } from "@/services/master-produk/import.service"

const ACCEPT = ".xlsx,.xls,.csv"
const MAX_SIZE = 20 * 1024 * 1024

interface Props {
  type: ImportBatchType
  open: boolean
  onOpenChange: (open: boolean) => void
  onQueued?: () => void
}

export function ImportDialog({ type, open, onOpenChange, onQueued }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [file, setFile] = React.useState<File | null>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [sizeError, setSizeError] = React.useState(false)

  const importFile = useImportFile()

  const title = type === "single" ? "Import Produk Satuan" : "Import Produk Bundle"
  const description =
    type === "single"
      ? "Upload file Excel berisi data produk satuan. Download template terlebih dahulu."
      : "Upload file Excel berisi komposisi bundle. Download template terlebih dahulu."

  const reset = () => {
    setFile(null)
    setSizeError(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleFile = (f: File | undefined) => {
    if (!f) return
    if (f.size > MAX_SIZE) {
      setSizeError(true)
      setFile(null)
      return
    }
    setSizeError(false)
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async () => {
    if (!file) return
    await importFile.mutateAsync({ type, file })
    reset()
    onOpenChange(false)
    onQueued?.()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Template download */}
          <a
            href={ImportService.templateUrl(type)}
            download
            className="flex items-center gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm transition-colors hover:bg-primary/10"
          >
            <DownloadIcon className="size-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-primary">Download Template</div>
              <div className="text-xs text-muted-foreground">
                {type === "single"
                  ? "Template_Import_Product.xlsx"
                  : "Template_Import_Bundle.xlsx"}
              </div>
            </div>
          </a>

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40 hover:bg-muted/30"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {file ? (
              <>
                <FileSpreadsheetIcon className="size-10 text-emerald-600 dark:text-emerald-400" />
                <div className="font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    reset()
                  }}
                  className="text-xs font-medium text-destructive hover:underline"
                >
                  Hapus
                </button>
              </>
            ) : (
              <>
                <UploadIcon className="size-8 text-muted-foreground" />
                <div className="text-sm font-medium">
                  Drag & drop file atau klik untuk pilih
                </div>
                <div className="text-xs text-muted-foreground">
                  Format: .xlsx, .xls, .csv — Maks 20 MB
                </div>
              </>
            )}
          </div>

          {sizeError && (
            <p className="text-sm text-destructive">
              File terlalu besar. Maksimal 20 MB.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              disabled={!file || importFile.isPending}
              onClick={handleSubmit}
            >
              {importFile.isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <UploadIcon className="size-4" />
                  Import
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
