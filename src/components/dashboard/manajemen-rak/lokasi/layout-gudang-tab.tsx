"use client"

import * as React from "react"
import { SearchIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import {
  buildBinPreview,
  binCombinationCount,
  MAX_BIN_COMBINATIONS,
} from "@/lib/manajemen-rak/bin-preview"
import type { BinPreviewItem, GenerateBinsPayload } from "@/types/manajemen-rak/location"

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

interface UniformDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (values: { maxQty: number; isStockAcknowledged: boolean; isLargeBin: boolean; category: string }) => void
}

function UniformDialog({ open, onOpenChange, onApply }: UniformDialogProps) {
  const [maxQty, setMaxQty] = React.useState("0")
  const [isStockAcknowledged, setIsStockAcknowledged] = React.useState(true)
  const [isLargeBin, setIsLargeBin] = React.useState(false)
  const [category, setCategory] = React.useState("")

  const handleApply = () => {
    onApply({
      maxQty: Number.parseInt(maxQty, 10) || 0,
      isStockAcknowledged,
      isLargeBin,
      category,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seragamkan</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          <div className="space-y-2">
            <Label>Maks. Qty</Label>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={maxQty}
              onChange={(e) => setMaxQty(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Kategori"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Gudang Besar</Label>
            <Switch checked={isLargeBin} onCheckedChange={setIsLargeBin} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Akui Stok</Label>
            <Switch checked={isStockAcknowledged} onCheckedChange={setIsStockAcknowledged} />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={handleApply}>
            Terapkan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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

  const [bins, setBins] = React.useState<BinPreviewItem[]>(initialBins ?? [])
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [uniformOpen, setUniformOpen] = React.useState(false)

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

    const generated = buildBinPreview(payload)
    setBins(generated)
    setSelected(new Set())
    onApply(payload)
    toast.success(`${total} kombinasi rak siap disimpan.`)
  }

  const updateBin = (code: string, field: keyof BinPreviewItem, value: unknown) => {
    setBins((prev) =>
      prev.map((b) => (b.binFinalCode === code ? { ...b, [field]: value } : b))
    )
  }

  const deleteBin = (code: string) => {
    setBins((prev) => prev.filter((b) => b.binFinalCode !== code))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(code)
      return next
    })
  }

  const deleteSelected = () => {
    setBins((prev) => prev.filter((b) => !selected.has(b.binFinalCode)))
    setSelected(new Set())
  }

  const filtered = search.trim()
    ? bins.filter((b) =>
        b.binFinalCode.toLowerCase().includes(search.trim().toLowerCase())
      )
    : bins

  const filteredCodes = filtered.map((b) => b.binFinalCode)
  const allSelected = filteredCodes.length > 0 && filteredCodes.every((c) => selected.has(c))
  const someSelected = filteredCodes.some((c) => selected.has(c))

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredCodes))
    }
  }

  const toggleOne = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const handleUniformApply = (values: {
    maxQty: number
    isStockAcknowledged: boolean
    isLargeBin: boolean
    category: string
  }) => {
    setBins((prev) =>
      prev.map((b) =>
        selected.has(b.binFinalCode)
          ? {
              ...b,
              maxQty: values.maxQty,
              isStockAcknowledged: values.isStockAcknowledged,
              isLargeBin: values.isLargeBin,
              category: values.category,
            }
          : b
      )
    )
    setSelected(new Set())
    toast.success("Pengaturan rak terpilih diseragamkan.")
  }

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
            Total <Badge className="ml-1">{bins.length}</Badge>
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Belum ada data rak.
          </div>
        ) : (
          <div className="rounded-2xl border border-border overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="w-10 px-3 py-3">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={toggleAll}
                      disabled={disabled}
                    />
                  </th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Kode Rak</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Maks. Qty</th>
                  <th className="px-3 py-3 text-center font-medium text-muted-foreground">Akui Stok</th>
                  <th className="px-3 py-3 text-center font-medium text-muted-foreground">Gudang Besar</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Kategori</th>
                  <th className="w-12 px-3 py-3" />
                </tr>

                {selected.size > 0 && (
                  <tr className="border-b border-primary/20 bg-primary/5">
                    <td colSpan={7} className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={allSelected ? true : "indeterminate"}
                          onCheckedChange={toggleAll}
                        />
                        <span className="text-sm font-medium">
                          {selected.size} Item terpilih
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={deleteSelected}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setUniformOpen(true)}
                        >
                          Seragamkan
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((b) => {
                  const isSelected = selected.has(b.binFinalCode)
                  return (
                    <tr
                      key={b.binFinalCode}
                      className={cn(
                        "border-b border-border/60 last:border-0",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(b.binFinalCode)}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          value={b.binFinalCode}
                          readOnly
                          disabled
                          className="h-9 max-w-[200px] bg-muted/30"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={b.maxQty}
                          onChange={(e) =>
                            updateBin(b.binFinalCode, "maxQty", Number.parseInt(e.target.value, 10) || 0)
                          }
                          disabled={disabled}
                          className="h-9 w-24"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Switch
                          checked={b.isStockAcknowledged}
                          onCheckedChange={(v) => updateBin(b.binFinalCode, "isStockAcknowledged", v)}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Switch
                          checked={b.isLargeBin}
                          onCheckedChange={(v) => updateBin(b.binFinalCode, "isLargeBin", v)}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          value={b.category}
                          onChange={(e) => updateBin(b.binFinalCode, "category", e.target.value)}
                          disabled={disabled}
                          placeholder="Kategori"
                          className="h-9 max-w-[180px]"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        {!disabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteBin(b.binFinalCode)}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length > 200 && (
              <p className="px-3 py-2 text-center text-xs text-muted-foreground">
                Menampilkan 200 dari {filtered.length} rak.
              </p>
            )}
          </div>
        )}
      </div>

      <UniformDialog
        open={uniformOpen}
        onOpenChange={setUniformOpen}
        onApply={handleUniformApply}
      />
    </div>
  )
}
