"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon, PackageSearchIcon, PlusIcon, Trash2Icon } from "lucide-react"

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
  const [createdBy, setCreatedBy] = useState("")
  const [lines, setLines] = useState<LineDraft[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)

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

  const addLines = (products: PickedProduct[]) => {
    setLines((prev) => {
      const existing = new Set(prev.map((l) => l.itemId))
      const fresh = products
        .filter((p) => !existing.has(p.itemId))
        .map((p) => ({ itemId: p.itemId, sku: p.sku, name: p.name, binId: "", actualQty: "" }))
      return [...prev, ...fresh]
    })
    setPickerOpen(false)
  }

  const updateLine = (itemId: string, patch: Partial<LineDraft>) =>
    setLines((prev) => prev.map((l) => (l.itemId === itemId ? { ...l, ...patch } : l)))
  const removeLine = (itemId: string) => setLines((prev) => prev.filter((l) => l.itemId !== itemId))

  const validLines = lines.filter((l) => l.actualQty !== "" && Number(l.actualQty) >= 0)
  const canSubmit = !!locationId && !!transactionDate && !!createdBy.trim() && validLines.length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    createMut.mutate(
      {
        transaction_date: transactionDate,
        location_id: locationId,
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
        title="Buat Penyesuaian Stok"
        backHref={LIST_HREF}
        breadcrumb={[
          { label: "Persediaan" },
          { label: "Transaksi Stok", href: LIST_HREF },
          { label: "Buat Penyesuaian" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push(LIST_HREF)}>
            <ArrowLeftIcon className="mr-1.5 h-4 w-4" /> Kembali
          </Button>
        }
      />

      <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="grid grid-cols-1 gap-3 px-5 py-5 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Gudang <span className="text-red-500">*</span></Label>
            <Combobox
              options={locationOptions}
              value={locationId}
              onChange={(v) => { setLocationId(v ?? ""); setLines((p) => p.map((l) => ({ ...l, binId: "" }))) }}
              placeholder="Pilih gudang…"
              searchPlaceholder="Cari gudang…"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Tanggal <span className="text-red-500">*</span></Label>
            <Input type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Dibuat oleh <span className="text-red-500">*</span></Label>
            <UserSelect value={createdBy} onChange={setCreatedBy} defaultToSelf placeholder="Nama petugas" />
          </div>
        </div>
      </LiquidGlass>

      <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-col gap-3 px-5 py-5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Item Penyesuaian <span className="text-red-500">*</span></Label>
            <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)} className="gap-1.5">
              <PlusIcon className="h-4 w-4" /> Tambah Item
            </Button>
          </div>

          {lines.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-muted-foreground">
              <PackageSearchIcon className="h-7 w-7 opacity-40" />
              <p className="text-sm">Belum ada item. Klik tombol Tambah Item.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {lines.map((l) => (
                <div key={l.itemId} className="grid grid-cols-[1fr_180px_110px_auto] items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{l.sku}</p>
                  </div>
                  <Combobox
                    options={binOptions}
                    value={l.binId}
                    onChange={(v) => updateLine(l.itemId, { binId: v ?? "" })}
                    placeholder={binsLoading ? "Memuat…" : "Bin (opsional)"}
                    searchPlaceholder="Cari bin…"
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
                  <Button variant="ghost" size="icon-sm" onClick={() => removeLine(l.itemId)} aria-label="Hapus" className="text-destructive">
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
        <Button variant="outline" onClick={() => router.push(LIST_HREF)}>Batal</Button>
        <Button onClick={handleSubmit} disabled={!canSubmit || createMut.isPending}>
          {createMut.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Draft
        </Button>
      </div>

      <ProductPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={addLines}
        excludeIds={lines.map((l) => l.itemId)}
      />
    </div>
  )
}
