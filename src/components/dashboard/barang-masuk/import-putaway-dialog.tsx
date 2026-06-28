"use client"

import * as React from "react"
import { useState, useRef, useCallback } from "react"
import { UploadIcon, DownloadIcon, Loader2Icon, CheckCircleIcon, XCircleIcon } from "lucide-react"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PutawayService } from "@/services/barang-masuk/putaway.service"
import { exportCsv } from "@/lib/export-csv"

interface ImportRow {
  sku: string
  bin_code: string
  qty: number
  sn: string
  batch_no: string
  exp_date: string
}

type RowStatus = "pending" | "processing" | "success" | "error"

interface ProcessedRow extends ImportRow {
  status: RowStatus
  message?: string
}

function parseCsv(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []

  const header = lines[0].toLowerCase().replace(/^﻿/, "")
  const cols = header.split(",").map((c) => c.trim())

  const skuIdx = cols.findIndex((c) => c === "sku")
  const binIdx = cols.findIndex((c) => c === "bin_code")
  const qtyIdx = cols.findIndex((c) => c === "qty")
  const snIdx = cols.findIndex((c) => c === "sn")
  const batchIdx = cols.findIndex((c) => c === "batch_no")
  const expIdx = cols.findIndex((c) => c === "exp_date")

  if (skuIdx === -1 || binIdx === -1 || qtyIdx === -1) return []

  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
    return {
      sku: vals[skuIdx] ?? "",
      bin_code: vals[binIdx] ?? "",
      qty: parseInt(vals[qtyIdx] ?? "0") || 0,
      sn: snIdx >= 0 ? vals[snIdx] ?? "" : "",
      batch_no: batchIdx >= 0 ? vals[batchIdx] ?? "" : "",
      exp_date: expIdx >= 0 ? vals[expIdx] ?? "" : "",
    }
  }).filter((r) => r.sku && r.bin_code && r.qty > 0)
}

function downloadTemplate() {
  exportCsv("template-putaway.csv", ["sku", "bin_code", "qty", "sn", "batch_no", "exp_date"], [
    ["SKU-001", "A-01-01", "10", "", "", ""],
    ["SKU-002", "B-02-03", "5", "SN12345", "BATCH-01", "2026-12-31"],
  ])
}

interface ImportPutawayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  putawayId: string
  locationId: string
  onComplete: () => void
}

export function ImportPutawayDialog({ open, onOpenChange, putawayId, locationId, onComplete }: ImportPutawayDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ProcessedRow[]>([])
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseCsv(reader.result as string)
      setRows(parsed.map((r) => ({ ...r, status: "pending" as RowStatus })))
      setDone(false)
    }
    reader.readAsText(file)
  }, [])

  const handleProcess = useCallback(async () => {
    if (rows.length === 0) return
    setProcessing(true)
    setDone(false)

    const updated = [...rows]

    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: "processing" }
      setRows([...updated])

      try {
        const binResult = await PutawayService.lookupBin(updated[i].bin_code, locationId)

        const itemsRes = await PutawayService.getItems(putawayId)
        const matchItem = itemsRes.find((item) => item.variant?.sku === updated[i].sku)

        if (!matchItem) {
          updated[i] = { ...updated[i], status: "error", message: `SKU "${updated[i].sku}" tidak ditemukan` }
          setRows([...updated])
          continue
        }

        await PutawayService.processItem(putawayId, matchItem.id, {
          destination_bin_id: binResult.id,
          qty: updated[i].qty,
        })

        updated[i] = { ...updated[i], status: "success", message: "Berhasil" }
      } catch (err) {
        updated[i] = { ...updated[i], status: "error", message: (err as { message?: string })?.message || "Gagal" }
      }
      setRows([...updated])
    }

    setProcessing(false)
    setDone(true)
    onComplete()
  }, [rows, putawayId, locationId, onComplete])

  const handleClose = useCallback((o: boolean) => {
    if (processing) return
    if (!o) {
      setRows([])
      setDone(false)
      if (fileRef.current) fileRef.current.value = ""
    }
    onOpenChange(o)
  }, [processing, onOpenChange])

  const columns = React.useMemo<ColumnDef<ProcessedRow>[]>(() => [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku}</span>,
    },
    {
      accessorKey: "bin_code",
      header: "Rak",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.bin_code}</span>,
    },
    {
      accessorKey: "qty",
      header: "Qty",
      cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{row.original.qty}</span>,
    },
    {
      accessorKey: "sn",
      header: "SN",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.sn || "—"}</span>,
    },
    {
      accessorKey: "batch_no",
      header: "Batch",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.batch_no || "—"}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const r = row.original;
        if (r.status === "pending") return <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-600">Menunggu</Badge>;
        if (r.status === "processing") return <Loader2Icon className="h-4 w-4 animate-spin text-primary" />;
        if (r.status === "success") return <CheckCircleIcon className="h-4 w-4 text-emerald-500" />;
        if (r.status === "error") return (
          <span className="flex items-center gap-1">
            <XCircleIcon className="h-4 w-4 text-red-500" />
            <span className="text-xs text-red-500">{r.message}</span>
          </span>
        );
        return null;
      },
    },
  ], [])

  const successCount = rows.filter((r) => r.status === "success").length
  const errorCount = rows.filter((r) => r.status === "error").length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import CSV Penempatan</DialogTitle>
          <DialogDescription>
            Upload file CSV untuk batch penempatan barang ke rak.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <DownloadIcon className="mr-1.5 h-4 w-4" />
              Download Template
            </Button>
            <span className="text-xs text-muted-foreground">Format: sku, bin_code, qty, sn, batch_no, exp_date</span>
          </div>

          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
            />
          </div>

          {rows.length > 0 && (
                        <div className="max-h-64 border border-border/40 rounded-lg overflow-hidden">
              <DataTable
                columns={columns}
                data={rows}
                hideToolbar
                manualPagination={false}
                tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
              />
            </div>
          )}

          {done && (
            <div className="rounded-md border border-border/40 bg-muted/20 px-3 py-2 text-sm">
              Selesai: <span className="font-medium text-emerald-600">{successCount} berhasil</span>
              {errorCount > 0 && <>, <span className="font-medium text-red-600">{errorCount} gagal</span></>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={processing}>
            {done ? "Tutup" : "Batal"}
          </Button>
          {!done && rows.length > 0 && (
            <Button onClick={handleProcess} disabled={processing || rows.length === 0}>
              {processing && <Loader2Icon className="mr-1.5 h-4 w-4 animate-spin" />}
              <UploadIcon className="mr-1.5 h-4 w-4" />
              Proses {rows.length} baris
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
