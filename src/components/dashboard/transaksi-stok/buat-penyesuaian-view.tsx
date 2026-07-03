"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2Icon,
  PackageSearchIcon,
  PlusIcon,
  ScanBarcodeIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { PageTitle } from "@/components/dashboard/page-title"
import { UserSelect } from "@/components/dashboard/shared/user-select"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { useLocationBins } from "@/hooks/transaksi-stok/use-bin-transfer"
import { useCreateStockAdjustment } from "@/hooks/transaksi-stok/use-stock-adjustments"
import { ProductPickerDialog, type PickedProduct } from "@/components/dashboard/transaksi-pembelian/product-picker-dialog"
import { InventoryStockService } from "@/services/persediaan/inventory.service"
import { cn } from "@/lib/utils"
import { playScanFeedback } from "@/lib/scan-feedback"

const LIST_HREF = "/dashboard/transaksi-stok?tab=penyesuaian"

interface LineDraft {
  itemId: string
  sku: string
  name: string
  binId: string
  actualQty: string
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function BuatPenyesuaianView() {
  const router = useRouter()
  const [locationId, setLocationId] = useState("")
  const [transactionDate, setTransactionDate] = useState(todayStr)
  const [notes, setNotes] = useState("")
  const [createdBy, setCreatedBy] = useState("")
  const [lines, setLines] = useState<LineDraft[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerSearch, setPickerSearch] = useState<string | undefined>(undefined)
  const [scanCode, setScanCode] = useState("")
  const [scanning, setScanning] = useState(false)
  const [scanFlash, setScanFlash] = useState<"ok" | "err" | null>(null)
  const scanRef = useRef<HTMLInputElement>(null)

  const { data: locData } = useLocations({ perPage: 100 })
  const { data: binData, isLoading: binsLoading } = useLocationBins(locationId)
  const createMut = useCreateStockAdjustment()

  const locationOptions = useMemo(
    () => (locData?.items ?? []).map((l) => ({ value: l.id, label: l.locationName })),
    [locData]
  )
  const binOptions = useMemo(
    () => (binData?.items ?? []).map((b) => ({ value: b.id, label: b.binFinalCode })),
    [binData]
  )

  // Fokuskan input scan saat lokasi sudah dipilih — UX ala gudang.
  useEffect(() => {
    if (locationId) scanRef.current?.focus()
  }, [locationId])

  const addLines = (products: PickedProduct[]) => {
    setLines((prev) => {
      const existing = new Set(prev.map((l) => l.itemId))
      const fresh = products
        .filter((p) => !existing.has(p.itemId))
        .map((p) => ({ itemId: p.itemId, sku: p.sku, name: p.name, binId: "", actualQty: "" }))
      return [...prev, ...fresh]
    })
    setPickerOpen(false)
    setPickerSearch(undefined)
    // Kembalikan fokus ke input scan setelah picker ditutup (naikkan ke 250ms
    // agar animasi close Radix Dialog selesai sebelum focus).
    setTimeout(() => scanRef.current?.focus(), 250)
  }

  const flash = (state: "ok" | "err") => {
    setScanFlash(state)
    playScanFeedback(state === "ok" ? "ok" : "error")
    setTimeout(() => setScanFlash(null), 350)
  }

  const updateLine = (itemId: string, patch: Partial<LineDraft>) =>
    setLines((prev) => prev.map((l) => (l.itemId === itemId ? { ...l, ...patch } : l)))
  const removeLine = (itemId: string) => setLines((prev) => prev.filter((l) => l.itemId !== itemId))

  const handleScan = async () => {
    const q = scanCode.trim()
    if (!q || scanning) return

    setScanning(true)
    try {
      const res = await InventoryStockService.bySku(q)
      const variant = res.data
      // Cek duplicate — jangan tambah kalau sudah ada.
      if (lines.some((l) => l.itemId === variant.id)) {
        flash("err")
        return
      }
      const picked: PickedProduct = {
        itemId: variant.id,
        sku: variant.sku,
        name: variant.product?.name ?? variant.sku,
        variantLabel: "",
        thumbnail: null,
        sellPrice: null,
      }
      addLines([picked])
      flash("ok")
    } catch (err) {
      // Kalau SKU tidak ketemu (404) atau error lain → buka picker sebagai fallback
      // supaya operator bisa cari manual.
      const status = (err as { status?: number })?.status
      if (status === 404) {
        setPickerSearch(q)
        setPickerOpen(true)
      } else {
        flash("err")
      }
    } finally {
      setScanning(false)
      setScanCode("")
    }
  }

  const validLines = lines.filter((l) => l.actualQty !== "" && Number(l.actualQty) >= 0)
  const canSubmit = !!locationId && !!transactionDate && !!createdBy.trim() && validLines.length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    createMut.mutate(
      {
        transaction_date: transactionDate,
        location_id: locationId,
        notes: notes.trim() || undefined,
        created_by: createdBy.trim(),
        items: validLines.map((l) => ({
          item_id: l.itemId,
          bin_id: l.binId || undefined,
          actual_qty: Number(l.actualQty),
        })),
      },
      { onSuccess: () => router.push(LIST_HREF) }
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title="Buat Koreksi Stok"
        backHref={LIST_HREF}
        breadcrumb={[
          { label: "Persediaan" },
          { label: "Transaksi Stok", href: LIST_HREF },
          { label: "Buat Koreksi Stok" },
        ]}
      />

      {/* Field header — 4 kolom bisnis: No, Tanggal, Lokasi, Keterangan */}
      <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">No. Penyesuaian</Label>
            <Input
              value="[auto]"
              readOnly
              disabled
              className="cursor-not-allowed text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Otomatis dengan prefix ADJ setelah disimpan.</p>
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
                setLines((p) => p.map((l) => ({ ...l, binId: "" })))
              }}
              placeholder="Pilih lokasi…"
              searchPlaceholder="Cari lokasi…"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Keterangan</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alasan koreksi (opsional)"
            />
          </div>
        </div>
      </LiquidGlass>

      {/* Field created_by di balik layar — auto-populate ke user aktif, tidak dirender */}
      <div className="sr-only" aria-hidden="true">
        <UserSelect value={createdBy} onChange={setCreatedBy} defaultToSelf placeholder="Petugas" />
      </div>

      {/* Item + scan bar */}
      <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Item Koreksi Stok <span className="text-red-500">*</span>
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPickerOpen(true)}
              className="gap-1.5"
            >
              <PlusIcon className="h-4 w-4" /> Tambah Item
            </Button>
          </div>

          {/* Scan SKU */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              {scanning ? (
                <Loader2Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-primary" />
              ) : (
                <ScanBarcodeIcon
                  className={cn(
                    "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors",
                    scanFlash === "ok"
                      ? "text-emerald-500"
                      : scanFlash === "err"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                />
              )}
              <Input
                ref={scanRef}
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleScan()
                  }
                }}
                placeholder={
                  locationId
                    ? "Scan / ketik SKU lalu Enter…"
                    : "Pilih lokasi dulu untuk mulai scan…"
                }
                disabled={!locationId || scanning}
                className={cn(
                  "h-10 pl-9 text-base transition-colors",
                  scanFlash === "ok" && "border-emerald-500 ring-2 ring-emerald-500/30",
                  scanFlash === "err" && "border-destructive ring-2 ring-destructive/30"
                )}
                autoComplete="off"
              />
            </div>
            <p className="hidden text-xs text-muted-foreground sm:flex sm:items-center sm:w-64">
              SKU exact match langsung tambah. Rak bisa di-scan lewat kolom Rak.
            </p>
          </div>

          {lines.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-muted-foreground">
              <PackageSearchIcon className="h-7 w-7 opacity-40" />
              <p className="text-sm">Belum ada item. Scan SKU atau klik Tambah Item.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {lines.map((l) => (
                <div
                  key={l.itemId}
                  className="grid grid-cols-[1fr_200px_110px_auto] items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{l.sku}</p>
                  </div>
                  <Combobox
                    options={binOptions}
                    value={l.binId}
                    onChange={(v) => updateLine(l.itemId, { binId: v ?? "" })}
                    placeholder={binsLoading ? "Memuat rak…" : "Scan / pilih rak"}
                    searchPlaceholder="Scan / cari rak…"
                    disabled={!locationId || binsLoading}
                    className="h-9"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={l.actualQty}
                    onChange={(e) => updateLine(l.itemId, { actualQty: e.target.value })}
                    placeholder="Qty riil"
                    className="h-9"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeLine(l.itemId)}
                    aria-label="Hapus"
                    className="text-destructive"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Qty riil = jumlah fisik hasil hitung. Selisih terhadap stok sistem dihitung otomatis saat disimpan.
              </p>
            </div>
          )}
        </div>
      </LiquidGlass>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push(LIST_HREF)}>
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit || createMut.isPending}>
          {createMut.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          Simpan
        </Button>
      </div>

      <ProductPickerDialog
        open={pickerOpen}
        onOpenChange={(v) => {
          setPickerOpen(v)
          if (!v) setPickerSearch(undefined)
        }}
        onPick={addLines}
        excludeIds={lines.map((l) => l.itemId)}
        initialSearch={pickerSearch}
      />
    </div>
  )
}
