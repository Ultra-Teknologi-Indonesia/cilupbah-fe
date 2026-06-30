"use client"

import * as React from "react"
import {
  SearchIcon,
  Trash2Icon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Loader2Icon,
  PrinterIcon,
} from "lucide-react"
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
import { SimplePagination } from "@/components/ui/simple-pagination"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BIN_QR_PAPER_DEFAULT,
  type BinQrPaper,
} from "@/services/manajemen-rak/location.service"

const PAPER_OPTIONS: { value: BinQrPaper; label: string }[] = [
  { value: "thermal_50x40", label: "Thermal 50x40mm" },
  { value: "thermal_80x40", label: "Thermal 80x40mm" },
  { value: "a4_single", label: "A4 (1 QR per halaman)" },
  { value: "a4_multi", label: "A4 (8 QR per halaman)" },
]
import {
  buildBinPreview,
  binCombinationCount,
  MAX_BIN_COMBINATIONS,
} from "@/lib/manajemen-rak/bin-preview"
import {
  useLocationBins,
  useUniformApplyBins,
} from "@/hooks/manajemen-rak/use-location-bins"
import type {
  BinDraft,
  BinListParams,
  BinPreviewItem,
  GenerateBinsPayload,
} from "@/types/manajemen-rak/location"

const PER_PAGE_OPTIONS = [50, 100, 200] as const

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
  pending?: boolean
  scopeLabel?: string
}

function UniformDialog({ open, onOpenChange, onApply, pending, scopeLabel }: UniformDialogProps) {
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
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seragamkan {scopeLabel ? `(${scopeLabel})` : ""}</DialogTitle>
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
          <Button variant="primary" onClick={handleApply} disabled={pending}>
            {pending && <Loader2Icon className="mr-2 size-3.5 animate-spin" />}
            Terapkan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Visual gudang 3D (isometrik) ─────────────────────────────────────────────
interface WarehouseVisualProps {
  floors: number
  rows: number
  columns: number
  bins: number
}

function WarehouseVisual({ floors, rows, columns, bins }: WarehouseVisualProps) {
  const empty = floors < 1 && rows < 1 && columns < 1 && bins < 1

  if (empty) {
    return (
      <div className="flex h-full min-h-[240px] w-full items-center justify-center rounded-2xl border border-dashed border-border px-6 text-center text-xs text-muted-foreground">
        Isi jumlah lantai, baris, kolom, dan rak untuk melihat pratinjau gudang 3D.
      </div>
    )
  }

  const F = Math.min(Math.max(floors, 1), 3)
  const R = Math.min(Math.max(rows, 1), 3)
  const C = Math.min(Math.max(columns, 1), 6)
  const B = Math.min(Math.max(bins, 1), 5)

  const COS = 0.866
  const SIN = 0.5
  const U = 24
  const LH = 8
  const RD = 0.62
  const AISLE = 0.5
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
  const poly = (target: React.ReactNode[], arr: [number, number][], fill: string, stroke = "none", sw = 0) =>
    target.push(
      <polygon key={`p${kid++}`} points={ptsOf(arr)} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    )
  const line = (target: React.ReactNode[], a: [number, number], b: [number, number], stroke: string, sw: number) =>
    target.push(
      <line key={`l${kid++}`} x1={a[0].toFixed(1)} y1={a[1].toFixed(1)} x2={b[0].toFixed(1)} y2={b[1].toFixed(1)} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    )

  const wallEls: React.ReactNode[] = []
  poly(wallEls, [pt(0, 0, 0), pt(0, GY, 0), pt(0, GY, maxZ), pt(0, 0, maxZ)], WALL_BACK)
  poly(wallEls, [pt(0, 0, 0), pt(GX, 0, 0), pt(GX, 0, maxZ), pt(0, 0, maxZ)], WALL_SIDE)

  const drawRack = (target: React.ReactNode[], x0: number, x1: number, y0: number, y1: number, zb: number) => {
    const zt = zb + shelfH
    poly(target, [pt(x0, y0, zt), pt(x1, y0, zt), pt(x1, y1, zt), pt(x0, y1, zt)], SHELF_TOP, FACE_STK, 0.5)
    poly(target, [pt(x1, y0, zb), pt(x1, y1, zb), pt(x1, y1, zt), pt(x1, y0, zt)], SHELF_END, FACE_STK, 0.5)
    poly(target, [pt(x0, y1, zb), pt(x1, y1, zb), pt(x1, y1, zt), pt(x0, y1, zt)], SHELF_FRONT, FACE_STK, 0.5)
    const bw = (x1 - x0) / C
    for (let i = 0; i < C; i++) {
      for (let kk = 0; kk < B; kk++) {
        const cx0 = x0 + i * bw + 0.07 * bw
        const cx1 = x0 + (i + 1) * bw - 0.07 * bw
        const cz0 = zb + kk * LH + 1.6
        const cz1 = zb + (kk + 1) * LH - 1.6
        poly(target, [pt(cx0, y1, cz0), pt(cx1, y1, cz0), pt(cx1, y1, cz1), pt(cx0, y1, cz1)], ITEM, ITEM_STK, 0.4)
      }
    }
    for (let kk = 0; kk <= B; kk++) {
      line(target, pt(x0, y1, zb + kk * LH), pt(x1, y1, zb + kk * LH), "#aab4c0", 0.6)
    }
    const posts: [number, number][] = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]
    for (let i = 1; i < C; i++) posts.push([x0 + i * bw, y1])
    for (const [vx, vy] of posts) line(target, pt(vx, vy, zb), pt(vx, vy, zt), POST, 1.7)
  }

  const floorEls: React.ReactNode[][] = []
  for (let f = 0; f < F; f++) {
    const base = f * floorH
    const ST = 4
    const fe: React.ReactNode[] = []
    poly(fe, [pt(0, 0, base), pt(GX, 0, base), pt(GX, GY, base), pt(0, GY, base)], BLUE_TOP)
    poly(fe, [pt(0, GY, base), pt(GX, GY, base), pt(GX, GY, base - ST), pt(0, GY, base - ST)], BLUE_S1)
    poly(fe, [pt(GX, 0, base), pt(GX, GY, base), pt(GX, GY, base - ST), pt(GX, 0, base - ST)], BLUE_S2)
    for (let r = 0; r < R; r++) {
      const y0 = M_BACK + r * (RD + AISLE)
      const y1 = y0 + RD
      drawRack(fe, M_SIDE, GX - M_SIDE, y0, y1, base)
    }
    floorEls.push(fe)
  }

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

// ─── Tipe data baris ───────────────────────────────────────────────────────
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

// ─── Header sort column ─────────────────────────────────────────────────────
function SortableHeader({
  label,
  field,
  currentSort,
  onSort,
}: {
  label: string
  field: string
  currentSort: string | undefined
  onSort: (sort: string | undefined) => void
}) {
  const isActive = currentSort === field || currentSort === `-${field}`
  const isDesc = currentSort === `-${field}`

  const handleClick = () => {
    if (!isActive) onSort(field)
    else if (!isDesc) onSort(`-${field}`)
    else onSort(undefined)
  }

  return (
    <button
      type="button"
      className="flex items-center gap-1 text-left font-medium text-muted-foreground hover:text-foreground"
      onClick={handleClick}
    >
      {label}
      {!isActive && <ArrowUpDownIcon className="size-3 opacity-60" />}
      {isActive && !isDesc && <ArrowUpIcon className="size-3" />}
      {isActive && isDesc && <ArrowDownIcon className="size-3" />}
    </button>
  )
}

interface LayoutGudangTabProps {
  disabled?: boolean
  locationId?: string  // edit-mode: pakai server pagination; create-mode: pakai initialBins
  initialBins?: BinDraft[]
  onApply: (payload: GenerateBinsPayload | null) => void
  // Dipanggil tiap daftar rak (atau Map edit) berubah agar parent bisa menyimpan via bulk-update.
  onBinsChange?: (bins: BinDraft[]) => void
}

export function LayoutGudangTab({
  disabled = false,
  locationId,
  initialBins,
  onApply,
  onBinsChange,
}: LayoutGudangTabProps) {
  const serverMode = !!locationId

  // ── Form generate baru ────────────────────────────────────────────────────
  const [floorCode, setFloorCode] = React.useState("L")
  const [rowCode, setRowCode] = React.useState("B")
  const [columnCode, setColumnCode] = React.useState("K")
  const [binCode, setBinCode] = React.useState("R")
  const [qtyFloor, setQtyFloor] = React.useState("")
  const [qtyRow, setQtyRow] = React.useState("")
  const [qtyColumn, setQtyColumn] = React.useState("")
  const [qtyBin, setQtyBin] = React.useState("")

  // ── State daftar rak ──────────────────────────────────────────────────────
  // localBins: dipakai di create-mode atau saat user baru saja generate sebelum disimpan.
  const [localBins, setLocalBins] = React.useState<BinRow[]>(() =>
    serverMode ? [] : (initialBins ?? []).map(toRow)
  )

  // editedMap: track perubahan per binId (server-mode) yang belum disimpan.
  const [editedMap, setEditedMap] = React.useState<Map<string, Partial<BinPreviewItem>>>(() => new Map())

  // ── Filter/pagination state (server-mode) ─────────────────────────────────
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState<number>(50)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [sort, setSort] = React.useState<string | undefined>(undefined)
  const [filter] = React.useState<BinListParams["filter"]>({})
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [selectAllAcrossPages, setSelectAllAcrossPages] = React.useState(false)
  const [uniformOpen, setUniformOpen] = React.useState(false)
  const [paperSize, setPaperSize] = React.useState<BinQrPaper>(BIN_QR_PAPER_DEFAULT)

  // Debounce search input → query
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  // Reset page saat filter/search/perPage berubah
  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, perPage, sort, filter])

  const params: BinListParams = {
    page,
    perPage,
    search: debouncedSearch || undefined,
    sort,
    filter,
  }

  const binsQuery = useLocationBins(locationId, params)
  const uniformMut = useUniformApplyBins(locationId)

  // Sinkronkan localBins / editedMap ke parent (parent submit bulk-update saat "Simpan" form).
  const onBinsChangeRef = React.useRef(onBinsChange)
  onBinsChangeRef.current = onBinsChange
  React.useEffect(() => {
    if (serverMode) {
      // Kirim hanya bin yang punya edit (binId WAJIB ada).
      const items: BinDraft[] = []
      for (const [binId, patch] of editedMap.entries()) {
        const row = binsQuery.data?.items.find((b) => b.id === binId)
        if (!row) continue
        items.push({
          id: binId,
          floorCode: row.floorCode ?? "",
          rowCode: row.rowCode ?? "",
          columnCode: row.columnCode ?? "",
          binCode: row.binCode ?? "",
          binFinalCode: patch.binFinalCode ?? row.binFinalCode,
          maxQty: patch.maxQty ?? row.maxQty,
          isStockAcknowledged: patch.isStockAcknowledged ?? row.isStockAcknowledged,
          isLargeBin: patch.isLargeBin ?? row.isLargeBin,
          category: patch.category ?? row.category ?? "",
        })
      }
      onBinsChangeRef.current?.(items)
    } else {
      onBinsChangeRef.current?.(localBins.map(toDraft))
    }
  }, [serverMode, localBins, editedMap, binsQuery.data])

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

    if (!serverMode) {
      const generated = buildBinPreview(payload).map(toRow)
      setLocalBins(generated)
    }
    onApply(payload)
    toast.success(
      serverMode
        ? `${total} kombinasi rak siap di-generate. Klik Simpan untuk menambah ke gudang.`
        : `${total} kombinasi rak siap disimpan.`
    )
  }

  // ── Per-row edit ──────────────────────────────────────────────────────────
  const updateLocalBin = (id: string, field: keyof BinPreviewItem, value: unknown) => {
    setLocalBins((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  const patchEdit = (binId: string, field: keyof BinPreviewItem, value: unknown) => {
    setEditedMap((prev) => {
      const next = new Map(prev)
      const existing = next.get(binId) ?? {}
      next.set(binId, { ...existing, [field]: value })
      return next
    })
  }

  // ── Selection ─────────────────────────────────────────────────────────────
  const pageItems: BinRow[] = serverMode
    ? (binsQuery.data?.items ?? []).map((row) => {
        const patch = editedMap.get(row.id) ?? {}
        return {
          id: row.id,
          binId: row.id,
          floorCode: row.floorCode ?? "",
          rowCode: row.rowCode ?? "",
          columnCode: row.columnCode ?? "",
          binCode: row.binCode ?? "",
          binFinalCode: patch.binFinalCode ?? row.binFinalCode,
          maxQty: patch.maxQty ?? row.maxQty,
          isStockAcknowledged: patch.isStockAcknowledged ?? row.isStockAcknowledged,
          isLargeBin: patch.isLargeBin ?? row.isLargeBin,
          category: patch.category ?? row.category ?? "",
        }
      })
    : (debouncedSearch
        ? localBins.filter((b) =>
            b.binFinalCode.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : localBins
      )

  const meta = binsQuery.data?.meta
  const totalAll = serverMode ? (meta?.total ?? 0) : localBins.length
  const lastPage = serverMode ? (meta?.last_page ?? 1) : 1

  const pageIds = pageItems.map((b) => b.id)
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id))
  const somePageSelected = pageIds.some((id) => selectedIds.has(id))

  const togglePageAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        pageIds.forEach((id) => next.delete(id))
        return next
      })
      setSelectAllAcrossPages(false)
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        pageIds.forEach((id) => next.add(id))
        return next
      })
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    if (selectAllAcrossPages) setSelectAllAcrossPages(false)
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setSelectAllAcrossPages(false)
  }

  // ── Hapus ─────────────────────────────────────────────────────────────────
  const deleteLocalBin = (id: string) => {
    setLocalBins((prev) => prev.filter((b) => b.id !== id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const deleteLocalSelected = () => {
    setLocalBins((prev) => prev.filter((b) => !selectedIds.has(b.id)))
    clearSelection()
  }

  // ── Seragamkan ────────────────────────────────────────────────────────────
  const handleUniformApplyLocal = (values: {
    maxQty: number
    isStockAcknowledged: boolean
    isLargeBin: boolean
    category: string
  }) => {
    setLocalBins((prev) =>
      prev.map((b) =>
        selectedIds.has(b.id)
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
    clearSelection()
    setUniformOpen(false)
    toast.success("Pengaturan rak terpilih diseragamkan.")
  }

  const handleUniformApplyServer = async (values: {
    maxQty: number
    isStockAcknowledged: boolean
    isLargeBin: boolean
    category: string
  }) => {
    if (selectedIds.size === 0 && !selectAllAcrossPages) {
      toast.error("Pilih minimal satu rak.")
      return
    }
    try {
      await uniformMut.mutateAsync({
        scope: selectAllAcrossPages ? "all" : "selected",
        ids: selectAllAcrossPages ? undefined : Array.from(selectedIds),
        values: {
          max_qty: values.maxQty,
          is_stock_acknowledged: values.isStockAcknowledged,
          is_large_bin: values.isLargeBin,
          category: values.category || null,
        },
        search: selectAllAcrossPages ? debouncedSearch || undefined : undefined,
        filter: selectAllAcrossPages ? filter : undefined,
      })
      clearSelection()
      setUniformOpen(false)
    } catch {
      /* toast handled in hook */
    }
  }

  const handleUniformApply = serverMode ? handleUniformApplyServer : handleUniformApplyLocal

  // ── Cetak QR ──────────────────────────────────────────────────────────────
  // Hanya tersedia di server-mode (butuh locationId + binId yang sudah tersimpan).
  const canPrintQr = serverMode && Boolean(locationId)

  const openQrPreview = (binIds: string[]) => {
    if (!canPrintQr || !locationId) return
    const params = new URLSearchParams({ paper: paperSize })
    // Strip falsy supaya tidak mengirim "" yang lolos filter Boolean.
    const cleanIds = binIds.filter((s) => typeof s === "string" && s.length > 0)
    if (cleanIds.length > 0) params.set("bin_ids", cleanIds.join(","))
    const url = `/dashboard/document-preview/bin-qr/${locationId}?${params.toString()}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const printQrSelected = () => {
    if (selectAllAcrossPages) {
      // BE tanpa bin_ids = cetak semua bin di lokasi (sesuai kontrak).
      openQrPreview([])
      return
    }
    if (selectedIds.size === 0) {
      toast.error("Pilih minimal satu rak.")
      return
    }
    openQrPreview(Array.from(selectedIds))
  }

  const printQrAll = () => openQrPreview([])

  const selectionScopeLabel = selectAllAcrossPages
    ? `semua ${totalAll} rak`
    : `${selectedIds.size} rak terpilih`

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
              * Maksimum kombinasi rak adalah {MAX_BIN_COMBINATIONS.toLocaleString("id-ID")}
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode rak"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Total <Badge className="ml-1">{totalAll.toLocaleString("id-ID")}</Badge>
            </span>
            {canPrintQr && totalAll > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Ukuran QR:</Label>
                  <Select
                    value={paperSize}
                    onValueChange={(v) => setPaperSize(v as BinQrPaper)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="h-9 w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAPER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={printQrAll}
                  disabled={disabled}
                >
                  <PrinterIcon className="size-4" />
                  Cetak Semua QR
                </Button>
              </>
            )}
          </div>
        </div>

        {serverMode && binsQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
            <Loader2Icon className="size-4 animate-spin" /> Memuat daftar rak…
          </div>
        ) : pageItems.length === 0 ? (
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
                      checked={allPageSelected ? true : somePageSelected ? "indeterminate" : false}
                      onCheckedChange={togglePageAll}
                      disabled={disabled}
                    />
                  </th>
                  <th className="px-3 py-3 text-left">
                    <SortableHeader label="Kode Rak" field="bin_final_code" currentSort={sort} onSort={setSort} />
                  </th>
                  <th className="px-3 py-3 text-left">
                    <SortableHeader label="Maks. Qty" field="max_qty" currentSort={sort} onSort={setSort} />
                  </th>
                  <th className="px-3 py-3 text-center font-medium text-muted-foreground">Akui Stok</th>
                  <th className="px-3 py-3 text-center font-medium text-muted-foreground">Gudang Besar</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Kategori</th>
                  <th className="w-24 px-3 py-3" />
                </tr>

                {/* Banner: select-all on this page (mirip Gmail) */}
                {serverMode && allPageSelected && !selectAllAcrossPages && totalAll > pageIds.length && (
                  <tr className="border-b border-primary/20 bg-primary/5">
                    <td colSpan={7} className="px-3 py-2 text-center text-sm">
                      Memilih {pageIds.length} rak di halaman ini.{" "}
                      <button
                        type="button"
                        className="font-medium text-primary underline"
                        onClick={() => setSelectAllAcrossPages(true)}
                      >
                        Pilih semua {totalAll.toLocaleString("id-ID")} rak.
                      </button>
                    </td>
                  </tr>
                )}
                {serverMode && selectAllAcrossPages && (
                  <tr className="border-b border-primary/20 bg-primary/5">
                    <td colSpan={7} className="px-3 py-2 text-center text-sm">
                      Memilih semua {totalAll.toLocaleString("id-ID")} rak.{" "}
                      <button
                        type="button"
                        className="font-medium text-primary underline"
                        onClick={clearSelection}
                      >
                        Batalkan.
                      </button>
                    </td>
                  </tr>
                )}

                {(selectedIds.size > 0 || selectAllAcrossPages) && (
                  <tr className="border-b border-primary/20 bg-primary/5">
                    <td colSpan={7} className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={allPageSelected ? true : "indeterminate"}
                          onCheckedChange={togglePageAll}
                        />
                        <span className="text-sm font-medium">{selectionScopeLabel}</span>
                        {!serverMode && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={deleteLocalSelected}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setUniformOpen(true)}
                        >
                          Seragamkan
                        </Button>
                        {canPrintQr && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={printQrSelected}
                            disabled={disabled}
                          >
                            <PrinterIcon className="size-4" />
                            Cetak QR
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </thead>
              <tbody>
                {pageItems.map((b) => {
                  const isSelected = selectedIds.has(b.id) || selectAllAcrossPages
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
                          disabled={disabled || selectAllAcrossPages}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          value={b.binFinalCode}
                          onChange={(e) =>
                            serverMode && b.binId
                              ? patchEdit(b.binId, "binFinalCode", e.target.value)
                              : updateLocalBin(b.id, "binFinalCode", e.target.value)
                          }
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
                          onChange={(e) => {
                            const v = Number.parseInt(e.target.value, 10) || 0
                            serverMode && b.binId
                              ? patchEdit(b.binId, "maxQty", v)
                              : updateLocalBin(b.id, "maxQty", v)
                          }}
                          disabled={disabled}
                          className="h-9 w-24"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Switch
                          checked={b.isStockAcknowledged}
                          onCheckedChange={(v) =>
                            serverMode && b.binId
                              ? patchEdit(b.binId, "isStockAcknowledged", v)
                              : updateLocalBin(b.id, "isStockAcknowledged", v)
                          }
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Switch
                          checked={b.isLargeBin}
                          onCheckedChange={(v) =>
                            serverMode && b.binId
                              ? patchEdit(b.binId, "isLargeBin", v)
                              : updateLocalBin(b.id, "isLargeBin", v)
                          }
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          value={b.category}
                          onChange={(e) =>
                            serverMode && b.binId
                              ? patchEdit(b.binId, "category", e.target.value)
                              : updateLocalBin(b.id, "category", e.target.value)
                          }
                          disabled={disabled}
                          placeholder="Kategori"
                          className="h-9 max-w-[180px]"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          {canPrintQr && b.binId && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => openQrPreview([b.binId!])}
                                  aria-label="Cetak QR Rak"
                                  disabled={disabled}
                                >
                                  <PrinterIcon className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cetak QR Rak</TooltipContent>
                            </Tooltip>
                          )}
                          {!disabled && !serverMode && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteLocalBin(b.id)}
                            >
                              <Trash2Icon className="size-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {serverMode && lastPage > 1 && (
              <div className="border-t border-border px-3 py-2">
                <SimplePagination
                  page={page}
                  lastPage={lastPage}
                  onPageChange={setPage}
                  perPage={perPage}
                  onPerPageChange={setPerPage}
                  pageSizeOptions={[...PER_PAGE_OPTIONS]}
                  total={totalAll}
                  isFetching={binsQuery.isFetching}
                />
              </div>
            )}
          </div>
        )}

        {serverMode && editedMap.size > 0 && (
          <p className="text-xs text-muted-foreground">
            {editedMap.size} rak diubah belum disimpan. Klik <strong>Simpan</strong> di atas untuk menerapkan.
          </p>
        )}
      </div>

      <UniformDialog
        open={uniformOpen}
        onOpenChange={setUniformOpen}
        onApply={handleUniformApply}
        pending={uniformMut.isPending}
        scopeLabel={selectionScopeLabel}
      />
    </div>
  )
}
