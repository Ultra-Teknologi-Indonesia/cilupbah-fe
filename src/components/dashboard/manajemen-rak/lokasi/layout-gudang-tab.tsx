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

function WarehouseVisual({
  floors,
  rows,
  columns,
  bins,
}: {
  floors: number
  rows: number
  columns: number
  bins: number
}) {
  const f = Math.min(Math.max(floors || 1, 1), 3)
  const r = Math.min(Math.max(rows || 1, 1), 3)
  const c = Math.min(Math.max(columns || 1, 1), 4)
  const b = Math.min(Math.max(bins || 1, 1), 4)

  const COS = 0.866
  const SIN = 0.5
  const U = 22
  const BH = 11
  const FGAP = 14
  const SW = 0.72
  const SD = 0.55

  const shelfH = b * BH
  const floorStep = shelfH + FGAP
  const maxZ = (f - 1) * floorStep + shelfH

  const hL = r * COS * U
  const hR = c * COS * U

  const pad = { t: 20, r: 50, b: 42, l: 58 }
  const W = pad.l + hL + hR + pad.r
  const H = pad.t + maxZ + (c + r) * SIN * U + pad.b

  const ox = pad.l + hL
  const oy = pad.t + maxZ

  const ix = (gx: number, gy: number, gz: number) => ox + (gx - gy) * COS * U
  const iy = (gx: number, gy: number, gz: number) => oy + (gx + gy) * SIN * U - gz

  const CL = { l: "#3B82F6", b: "#10B981", k: "#F59E0B", r: "#EF4444" }

  const shelves: React.ReactNode[] = []

  for (let fi = 0; fi < f; fi++) {
    const z = fi * floorStep

    shelves.push(
      <polygon
        key={`fp${fi}`}
        points={`${ix(0,0,z)},${iy(0,0,z)} ${ix(c,0,z)},${iy(c,0,z)} ${ix(c,r,z)},${iy(c,r,z)} ${ix(0,r,z)},${iy(0,r,z)}`}
        fill={`${CL.l}0C`}
        stroke={CL.l}
        strokeWidth={0.8}
        strokeOpacity={0.25}
      />
    )

    for (let rowI = 0; rowI < r; rowI++) {
      const ri = r - 1 - rowI
      for (let ci = 0; ci < c; ci++) {
        const gx = ci + (1 - SW) / 2
        const gy = ri + (1 - SD) / 2

        shelves.push(
          <g key={`sh${fi}${ri}${ci}`}>
            <polygon
              points={`${ix(gx,gy,z)},${iy(gx,gy,z)} ${ix(gx+SW,gy,z)},${iy(gx+SW,gy,z)} ${ix(gx+SW,gy,z+shelfH)},${iy(gx+SW,gy,z+shelfH)} ${ix(gx,gy,z+shelfH)},${iy(gx,gy,z+shelfH)}`}
              fill="#e8ecf1" stroke="#94a3b8" strokeWidth={0.5}
            />
            <polygon
              points={`${ix(gx+SW,gy,z)},${iy(gx+SW,gy,z)} ${ix(gx+SW,gy+SD,z)},${iy(gx+SW,gy+SD,z)} ${ix(gx+SW,gy+SD,z+shelfH)},${iy(gx+SW,gy+SD,z+shelfH)} ${ix(gx+SW,gy,z+shelfH)},${iy(gx+SW,gy,z+shelfH)}`}
              fill="#cbd5e1" stroke="#94a3b8" strokeWidth={0.5}
            />
            <polygon
              points={`${ix(gx,gy,z+shelfH)},${iy(gx,gy,z+shelfH)} ${ix(gx+SW,gy,z+shelfH)},${iy(gx+SW,gy,z+shelfH)} ${ix(gx+SW,gy+SD,z+shelfH)},${iy(gx+SW,gy+SD,z+shelfH)} ${ix(gx,gy+SD,z+shelfH)},${iy(gx,gy+SD,z+shelfH)}`}
              fill="#f1f5f9" stroke="#94a3b8" strokeWidth={0.5}
            />
            {Array.from({ length: b - 1 }, (_, bi) => {
              const bz = z + (bi + 1) * BH
              return (
                <line key={`d${bi}`}
                  x1={ix(gx,gy,bz)} y1={iy(gx,gy,bz)}
                  x2={ix(gx+SW,gy,bz)} y2={iy(gx+SW,gy,bz)}
                  stroke="#94a3b8" strokeWidth={0.4}
                />
              )
            })}
          </g>
        )
      }
    }
  }

  const kx0 = ix(0, 0, 0)
  const kx1 = ix(c, 0, 0)
  const ky0 = iy(0, 0, 0) + 20
  const ky1 = iy(c, 0, 0) + 20

  const bx0 = ix(0, 0, 0) - 20
  const bx1 = ix(0, r, 0) - 20
  const by0 = iy(0, 0, 0)
  const by1 = iy(0, r, 0)

  const rakGx = (1 - SW) / 2 + SW
  const rakGy = (1 - SD) / 2
  const rakX = ix(rakGx, rakGy, 0) + 10
  const rakY0 = iy(rakGx, rakGy, 0)
  const rakY1 = iy(rakGx, rakGy, shelfH)

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${Math.ceil(W)} ${Math.ceil(H)}`}
        className="w-full max-w-[280px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="wv-ak" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 1L8 4L0 7z" fill={CL.k} />
          </marker>
          <marker id="wv-ab" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 1L8 4L0 7z" fill={CL.b} />
          </marker>
        </defs>

        {shelves}

        {/* Kolom: arrow along front edge */}
        <line x1={ix(0,0,0)} y1={iy(0,0,0)+5} x2={kx0} y2={ky0} stroke={CL.k} strokeWidth={0.5} strokeDasharray="2,2" />
        <line x1={ix(c,0,0)} y1={iy(c,0,0)+5} x2={kx1} y2={ky1} stroke={CL.k} strokeWidth={0.5} strokeDasharray="2,2" />
        <line x1={kx0} y1={ky0} x2={kx1} y2={ky1} stroke={CL.k} strokeWidth={1.5} markerEnd="url(#wv-ak)" />
        <text x={(kx0+kx1)/2} y={(ky0+ky1)/2+14} textAnchor="middle" fill={CL.k} fontSize={10} fontWeight="600">Kolom</text>

        {/* Baris: arrow along left edge */}
        <line x1={ix(0,0,0)-5} y1={iy(0,0,0)} x2={bx0} y2={by0} stroke={CL.b} strokeWidth={0.5} strokeDasharray="2,2" />
        <line x1={ix(0,r,0)-5} y1={iy(0,r,0)} x2={bx1} y2={by1} stroke={CL.b} strokeWidth={0.5} strokeDasharray="2,2" />
        <line x1={bx0} y1={by0} x2={bx1} y2={by1} stroke={CL.b} strokeWidth={1.5} markerEnd="url(#wv-ab)" />
        <text x={(bx0+bx1)/2-14} y={(by0+by1)/2-6} textAnchor="middle" fill={CL.b} fontSize={10} fontWeight="600">Baris</text>

        {/* Lantai: bracket on far-left */}
        {f > 1 ? (() => {
          const lx = ix(0, r, 0) - 16
          const ly0 = iy(0, r, 0)
          const ly1 = iy(0, r, (f - 1) * floorStep)
          const mid = (ly0 + ly1) / 2
          return (
            <>
              <line x1={lx} y1={ly0} x2={lx} y2={ly1} stroke={CL.l} strokeWidth={1.5} />
              <line x1={lx-3} y1={ly0} x2={lx+3} y2={ly0} stroke={CL.l} strokeWidth={1.5} />
              <line x1={lx-3} y1={ly1} x2={lx+3} y2={ly1} stroke={CL.l} strokeWidth={1.5} />
              <text x={lx} y={mid-8} textAnchor="middle" fill={CL.l} fontSize={10} fontWeight="600"
                transform={`rotate(-90,${lx},${mid-8})`}>Lantai</text>
            </>
          )
        })() : (
          <>
            <line x1={ix(0,r,0)-5} y1={iy(0,r,0)} x2={ix(0,r,0)-18} y2={iy(0,r,0)} stroke={CL.l} strokeWidth={0.8} strokeDasharray="2,2" />
            <text x={ix(0,r,0)-22} y={iy(0,r,0)+3} textAnchor="end" fill={CL.l} fontSize={9} fontWeight="600">Lantai</text>
          </>
        )}

        {/* Rak: bracket on first shelf */}
        <line x1={rakX} y1={rakY0} x2={rakX} y2={rakY1} stroke={CL.r} strokeWidth={1.5} />
        <line x1={rakX-3} y1={rakY0} x2={rakX+3} y2={rakY0} stroke={CL.r} strokeWidth={1.5} />
        <line x1={rakX-3} y1={rakY1} x2={rakX+3} y2={rakY1} stroke={CL.r} strokeWidth={1.5} />
        <text x={rakX+8} y={(rakY0+rakY1)/2+3} fill={CL.r} fontSize={10} fontWeight="600">Rak</text>
      </svg>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: CL.l }} /> Lantai ({floors || 0})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: CL.b }} /> Baris ({rows || 0})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: CL.k }} /> Kolom ({columns || 0})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: CL.r }} /> Rak ({bins || 0})
        </span>
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

        <div className="hidden lg:flex items-center justify-center">
          <WarehouseVisual
            floors={Number.parseInt(qtyFloor, 10) || 0}
            rows={Number.parseInt(qtyRow, 10) || 0}
            columns={Number.parseInt(qtyColumn, 10) || 0}
            bins={Number.parseInt(qtyBin, 10) || 0}
          />
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
