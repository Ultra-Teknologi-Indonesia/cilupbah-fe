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
import type { BinDraft, BinPreviewItem, GenerateBinsPayload } from "@/types/manajemen-rak/location"

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

// ── Visual gudang 3D (isometrik) ─────────────────────────────────────────────
// Hanya struktural: berubah mengikuti jumlah Lantai/Baris/Kolom/Rak,
// tidak terpengaruh status aktif/nonaktif tiap bin.
interface WarehouseVisualProps {
  floors: number
  rows: number
  columns: number
  bins: number
}

function WarehouseVisual({ floors, rows, columns, bins }: WarehouseVisualProps) {
  const empty =
    floors < 1 && rows < 1 && columns < 1 && bins < 1

  if (empty) {
    return (
      <div className="flex h-full min-h-[240px] w-full items-center justify-center rounded-2xl border border-dashed border-border px-6 text-center text-xs text-muted-foreground">
        Isi jumlah lantai, baris, kolom, dan rak untuk melihat pratinjau gudang 3D.
      </div>
    )
  }

  // Batasi agar tetap terbaca (visual ilustratif, bukan 1:1).
  const F = Math.min(Math.max(floors, 1), 3)
  const R = Math.min(Math.max(rows, 1), 3)
  const C = Math.min(Math.max(columns, 1), 6)
  const B = Math.min(Math.max(bins, 1), 5)

  // Geometri isometrik.
  const COS = 0.866
  const SIN = 0.5
  const U = 24 // langkah grid horizontal (px)
  const LH = 8 // tinggi tiap level rak (px)
  const RD = 0.62 // kedalaman satu unit rak (satuan gy)
  const AISLE = 0.5 // jarak antar baris
  const M_BACK = 0.45
  const M_FRONT = 0.45
  const M_SIDE = 0.28

  const GX = C
  const depthRows = R * RD + (R - 1) * AISLE
  const GY = M_BACK + depthRows + M_FRONT
  const shelfH = B * LH
  const headroom = 13
  const floorH = shelfH + headroom
  const maxZ = F * floorH

  const padX = 18
  const padY = 18
  const W = (GX + GY) * COS * U + padX * 2
  const H = maxZ + (GX + GY) * SIN * U + padY * 2

  const ox = padX + GY * COS * U
  const oy = padY + maxZ

  const pt = (gx: number, gy: number, gz: number): [number, number] => [
    ox + (gx - gy) * COS * U,
    oy + (gx + gy) * SIN * U - gz,
  ]
  const ptsOf = (arr: [number, number][]) => arr.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")

  // Palet.
  const WALL_BACK = "#e6e9ef"
  const WALL_SIDE = "#d3d8e1"
  const BLUE_TOP = "#4361ee"
  const BLUE_S1 = "#3550c0"
  const BLUE_S2 = "#2c44a8"
  const SHELF_TOP = "#f2f5f9"
  const SHELF_FRONT = "#dfe5ec"
  const SHELF_END = "#cad2dc"
  const ITEM = "#fbfcfe"
  const ITEM_STK = "#c3ccd8"
  const FACE_STK = "#b7c0cc"
  const POST = "#334155"

  let kid = 0
  const poly = (
    target: React.ReactNode[],
    arr: [number, number][],
    fill: string,
    stroke = "none",
    sw = 0
  ) =>
    target.push(
      <polygon
        key={`p${kid++}`}
        points={ptsOf(arr)}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    )
  const line = (
    target: React.ReactNode[],
    a: [number, number],
    b: [number, number],
    stroke: string,
    sw: number
  ) =>
    target.push(
      <line
        key={`l${kid++}`}
        x1={a[0].toFixed(1)}
        y1={a[1].toFixed(1)}
        x2={b[0].toFixed(1)}
        y2={b[1].toFixed(1)}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    )

  // Dinding ruangan (sudut belakang) — statis, tidak ikut beranimasi.
  const wallEls: React.ReactNode[] = []
  poly(wallEls, [pt(0, 0, 0), pt(0, GY, 0), pt(0, GY, maxZ), pt(0, 0, maxZ)], WALL_BACK)
  poly(wallEls, [pt(0, 0, 0), pt(GX, 0, 0), pt(GX, 0, maxZ), pt(0, 0, maxZ)], WALL_SIDE)

  const drawRack = (
    target: React.ReactNode[],
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    zb: number
  ) => {
    const zt = zb + shelfH
    // Permukaan atas.
    poly(target, [pt(x0, y0, zt), pt(x1, y0, zt), pt(x1, y1, zt), pt(x0, y1, zt)], SHELF_TOP, FACE_STK, 0.5)
    // Sisi ujung (x = x1).
    poly(target, [pt(x1, y0, zb), pt(x1, y1, zb), pt(x1, y1, zt), pt(x1, y0, zt)], SHELF_END, FACE_STK, 0.5)
    // Muka depan (y = y1).
    poly(target, [pt(x0, y1, zb), pt(x1, y1, zb), pt(x1, y1, zt), pt(x0, y1, zt)], SHELF_FRONT, FACE_STK, 0.5)

    // Barang tersimpan: kotak per bay (kolom) per level (rak) di muka depan.
    const bw = (x1 - x0) / C
    for (let i = 0; i < C; i++) {
      for (let kk = 0; kk < B; kk++) {
        const cx0 = x0 + i * bw + 0.07 * bw
        const cx1 = x0 + (i + 1) * bw - 0.07 * bw
        const cz0 = zb + kk * LH + 1.6
        const cz1 = zb + (kk + 1) * LH - 1.6
        poly(
          target,
          [pt(cx0, y1, cz0), pt(cx1, y1, cz0), pt(cx1, y1, cz1), pt(cx0, y1, cz1)],
          ITEM,
          ITEM_STK,
          0.4
        )
      }
    }

    // Garis level (rak) di muka depan.
    for (let kk = 0; kk <= B; kk++) {
      line(target, pt(x0, y1, zb + kk * LH), pt(x1, y1, zb + kk * LH), "#aab4c0", 0.6)
    }

    // Tiang vertikal: sudut + pembatas bay.
    const posts: [number, number][] = [
      [x0, y0],
      [x1, y0],
      [x0, y1],
      [x1, y1],
    ]
    for (let i = 1; i < C; i++) posts.push([x0 + i * bw, y1])
    for (const [vx, vy] of posts) line(target, pt(vx, vy, zb), pt(vx, vy, zt), POST, 1.7)
  }

  // Tiap lantai dikelompokkan agar bisa beranimasi terpisah (bawah → atas).
  const floorEls: React.ReactNode[][] = []
  for (let f = 0; f < F; f++) {
    const base = f * floorH
    const ST = 4 // tebal slab
    const fe: React.ReactNode[] = []

    // Permukaan slab (atas).
    poly(fe, [pt(0, 0, base), pt(GX, 0, base), pt(GX, GY, base), pt(0, GY, base)], BLUE_TOP)
    // Sisi tebal slab (depan & kanan).
    poly(fe, [pt(0, GY, base), pt(GX, GY, base), pt(GX, GY, base - ST), pt(0, GY, base - ST)], BLUE_S1)
    poly(fe, [pt(GX, 0, base), pt(GX, GY, base), pt(GX, GY, base - ST), pt(GX, 0, base - ST)], BLUE_S2)

    for (let r = 0; r < R; r++) {
      const y0 = M_BACK + r * (RD + AISLE)
      const y1 = y0 + RD
      drawRack(fe, M_SIDE, GX - M_SIDE, y0, y1, base)
    }
    floorEls.push(fe)
  }

  // Tanda tangan struktur: animasi hanya dipicu saat bentuk berubah.
  const sig = `${F}-${R}-${C}-${B}`

  return (
    <div className="flex flex-col items-center gap-3">
      <style>{
        "@keyframes wvFloorIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}" +
        ".wv-floor{animation:wvFloorIn .45s cubic-bezier(.22,.61,.36,1) both}" +
        "@media (prefers-reduced-motion:reduce){.wv-floor{animation:none}}"
      }</style>
      <svg
        key={sig}
        viewBox={`0 0 ${Math.ceil(W)} ${Math.ceil(H)}`}
        className="w-full max-w-[300px]"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Pratinjau gudang ${floors} lantai, ${rows} baris, ${columns} kolom, ${bins} rak`}
      >
        {wallEls}
        {floorEls.map((fe, i) => (
          <g key={i} className="wv-floor" style={{ animationDelay: `${i * 90}ms` }}>
            {fe}
          </g>
        ))}
      </svg>

      <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[3px]" style={{ background: BLUE_TOP }} /> Lantai ({floors || 0})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[3px]" style={{ background: SHELF_END }} /> Baris ({rows || 0})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[3px]" style={{ background: SHELF_FRONT }} /> Kolom ({columns || 0})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[3px]" style={{ background: POST }} /> Rak ({bins || 0})
        </span>
      </div>
    </div>
  )
}

// Identitas baris stabil (`id`, untuk React key & pemetaan update/hapus/pilih),
// terpisah dari `binFinalCode` agar kode rak bisa diedit tanpa merusaknya.
// `binId` = id bin di BE (ada bila bin sudah tersimpan) untuk keperluan simpan.
type BinRow = BinPreviewItem & { id: string; binId?: string }

let binRowSeq = 0
function clientId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `bin-${Date.now()}-${binRowSeq++}`
}

function toRow(item: BinDraft): BinRow {
  return { ...item, id: clientId(), binId: item.id }
}

function toDraft(row: BinRow): BinDraft {
  const { id: _clientId, binId, ...rest } = row
  return { ...rest, id: binId }
}

interface LayoutGudangTabProps {
  disabled?: boolean
  initialBins?: BinDraft[]
  onApply: (payload: GenerateBinsPayload | null) => void
  // Dipanggil tiap daftar rak berubah agar parent bisa menyimpan via bulk-update.
  onBinsChange?: (bins: BinDraft[]) => void
}

export function LayoutGudangTab({
  disabled = false,
  initialBins,
  onApply,
  onBinsChange,
}: LayoutGudangTabProps) {
  const [floorCode, setFloorCode] = React.useState("L")
  const [rowCode, setRowCode] = React.useState("B")
  const [columnCode, setColumnCode] = React.useState("K")
  const [binCode, setBinCode] = React.useState("R")
  const [qtyFloor, setQtyFloor] = React.useState("")
  const [qtyRow, setQtyRow] = React.useState("")
  const [qtyColumn, setQtyColumn] = React.useState("")
  const [qtyBin, setQtyBin] = React.useState("")

  const [bins, setBins] = React.useState<BinRow[]>(() =>
    (initialBins ?? []).map(toRow)
  )
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [uniformOpen, setUniformOpen] = React.useState(false)

  // Sinkronkan daftar rak ke parent tanpa memicu render (disimpan via ref di parent).
  const onBinsChangeRef = React.useRef(onBinsChange)
  onBinsChangeRef.current = onBinsChange
  React.useEffect(() => {
    onBinsChangeRef.current?.(bins.map(toDraft))
  }, [bins])

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

    const generated = buildBinPreview(payload).map(toRow)
    setBins(generated)
    setSelected(new Set())
    onApply(payload)
    toast.success(`${total} kombinasi rak siap disimpan.`)
  }

  const updateBin = (id: string, field: keyof BinPreviewItem, value: unknown) => {
    setBins((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    )
  }

  const deleteBin = (id: string) => {
    setBins((prev) => prev.filter((b) => b.id !== id))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const deleteSelected = () => {
    setBins((prev) => prev.filter((b) => !selected.has(b.id)))
    setSelected(new Set())
  }

  const filtered = search.trim()
    ? bins.filter((b) =>
        b.binFinalCode.toLowerCase().includes(search.trim().toLowerCase())
      )
    : bins

  const filteredIds = filtered.map((b) => b.id)
  const allSelected = filteredIds.length > 0 && filteredIds.every((c) => selected.has(c))
  const someSelected = filteredIds.some((c) => selected.has(c))

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredIds))
    }
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
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
        selected.has(b.id)
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
      <div className="grid gap-6 lg:grid-cols-2">
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

        <div className="hidden lg:flex items-start justify-center">
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
                  const isSelected = selected.has(b.id)
                  return (
                    <tr
                      key={b.id}
                      className={cn(
                        "border-b border-border/60 last:border-0",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(b.id)}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          value={b.binFinalCode}
                          onChange={(e) => updateBin(b.id, "binFinalCode", e.target.value)}
                          disabled={disabled}
                          placeholder="Kode rak"
                          className="h-9 max-w-[200px]"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={b.maxQty}
                          onChange={(e) =>
                            updateBin(b.id, "maxQty", Number.parseInt(e.target.value, 10) || 0)
                          }
                          disabled={disabled}
                          className="h-9 w-24"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Switch
                          checked={b.isStockAcknowledged}
                          onCheckedChange={(v) => updateBin(b.id, "isStockAcknowledged", v)}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Switch
                          checked={b.isLargeBin}
                          onCheckedChange={(v) => updateBin(b.id, "isLargeBin", v)}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          value={b.category}
                          onChange={(e) => updateBin(b.id, "category", e.target.value)}
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
                            onClick={() => deleteBin(b.id)}
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
