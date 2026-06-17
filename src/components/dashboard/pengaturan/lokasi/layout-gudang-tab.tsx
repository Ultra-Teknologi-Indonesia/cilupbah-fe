"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  buildBinPreview,
  binCombinationCount,
  MAX_BIN_COMBINATIONS,
} from "@/lib/pengaturan/bin-preview"
import type { BinPreviewItem, GenerateBinsPayload } from "@/types/pengaturan/location"

interface DimensionRowProps {
  label: string
  qty: string
  code: string
  onQty: (v: string) => void
  onCode: (v: string) => void
  disabled?: boolean
}

function DimensionRow({ label, qty, code, onQty, onCode, disabled }: DimensionRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>
          {label}
          <span className="text-destructive"> *</span>
        </Label>
        <Input
          type="number"
          min={1}
          inputMode="numeric"
          placeholder={`Jumlah ${label.toLowerCase()}`}
          value={qty}
          onChange={(e) => onQty(e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label>Kode</Label>
        <Input
          value={code}
          onChange={(e) => onCode(e.target.value)}
          disabled={disabled}
          maxLength={10}
        />
      </div>
    </div>
  )
}

interface LayoutGudangTabProps {
  disabled?: boolean
  initialBins?: BinPreviewItem[]
  onApply: (payload: GenerateBinsPayload | null) => void
}

export function LayoutGudangTab({
  disabled = false,
  initialBins,
  onApply,
}: LayoutGudangTabProps) {
  const [floorCode, setFloorCode] = React.useState("L")
  const [rowCode, setRowCode] = React.useState("B")
  const [columnCode, setColumnCode] = React.useState("K")
  const [binCode, setBinCode] = React.useState("R")
  const [qtyFloor, setQtyFloor] = React.useState("")
  const [qtyRow, setQtyRow] = React.useState("")
  const [qtyColumn, setQtyColumn] = React.useState("")
  const [qtyBin, setQtyBin] = React.useState("")

  const [preview, setPreview] = React.useState<BinPreviewItem[]>(initialBins ?? [])
  const [search, setSearch] = React.useState("")

  function handleGenerate() {
    const payload: GenerateBinsPayload = {
      floor_code: floorCode || "L",
      qty_floor: Number.parseInt(qtyFloor, 10) || 0,
      row_code: rowCode || "B",
      qty_row: Number.parseInt(qtyRow, 10) || 0,
      column_code: columnCode || "K",
      qty_column: Number.parseInt(qtyColumn, 10) || 0,
      bin_code: binCode || "R",
      qty_bin: Number.parseInt(qtyBin, 10) || 0,
    }

    if (
      payload.qty_floor < 1 ||
      payload.qty_row < 1 ||
      payload.qty_column < 1 ||
      payload.qty_bin < 1
    ) {
      toast.error("Jumlah lantai, baris, kolom, dan rak minimal 1.")
      return
    }

    const total = binCombinationCount(payload)
    if (total > MAX_BIN_COMBINATIONS) {
      toast.error(
        `Maksimum kombinasi rak adalah ${MAX_BIN_COMBINATIONS}. Anda mencoba membuat ${total}.`
      )
      return
    }

    setPreview(buildBinPreview(payload))
    onApply(payload)
    toast.success(`${total} kombinasi rak siap disimpan.`)
  }

  const filtered = search.trim()
    ? preview.filter((b) =>
        b.binFinalCode.toLowerCase().includes(search.trim().toLowerCase())
      )
    : preview

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <DimensionRow label="Lantai" qty={qtyFloor} code={floorCode} onQty={setQtyFloor} onCode={setFloorCode} disabled={disabled} />
          <DimensionRow label="Baris" qty={qtyRow} code={rowCode} onQty={setQtyRow} onCode={setRowCode} disabled={disabled} />
          <DimensionRow label="Kolom" qty={qtyColumn} code={columnCode} onQty={setQtyColumn} onCode={setColumnCode} disabled={disabled} />
          <DimensionRow label="Rak" qty={qtyBin} code={binCode} onQty={setQtyBin} onCode={setBinCode} disabled={disabled} />

          <div>
            <Button type="button" variant="primary" onClick={handleGenerate} disabled={disabled}>
              Buat
            </Button>
            <p className="mt-2 text-xs text-destructive">
              * Maksimum kombinasi rak adalah {MAX_BIN_COMBINATIONS}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari rak"
              className="pl-9"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            Total <Badge className="ml-1">{preview.length}</Badge>
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Belum ada data rak.
          </div>
        ) : (
          <div className="rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Rak</TableHead>
                  <TableHead>Lantai</TableHead>
                  <TableHead>Baris</TableHead>
                  <TableHead>Kolom</TableHead>
                  <TableHead>Rak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 200).map((b) => (
                  <TableRow key={b.binFinalCode}>
                    <TableCell className="font-medium">{b.binFinalCode}</TableCell>
                    <TableCell>{b.floorCode}</TableCell>
                    <TableCell>{b.rowCode}</TableCell>
                    <TableCell>{b.columnCode}</TableCell>
                    <TableCell>{b.binCode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length > 200 && (
              <p className="px-3 py-2 text-center text-xs text-muted-foreground">
                Menampilkan 200 dari {filtered.length} rak.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
