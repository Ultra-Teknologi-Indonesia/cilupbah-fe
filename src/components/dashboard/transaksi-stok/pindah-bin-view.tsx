"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, ArrowRightIcon, Loader2Icon, PackageSearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { PageTitle } from "@/components/dashboard/page-title"
import { UserSelect } from "@/components/dashboard/shared/user-select"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { useBinTransfer, useLocationBins } from "@/hooks/transaksi-stok/use-bin-transfer"
import { ProductPickerDialog, type PickedProduct } from "@/components/dashboard/transaksi-pembelian/product-picker-dialog"

const LIST_HREF = "/dashboard/transaksi-stok?tab=transfer"

export function PindahBinView() {
  const router = useRouter()
  const [locationId, setLocationId] = useState("")
  const [item, setItem] = useState<PickedProduct | null>(null)
  const [sourceBinId, setSourceBinId] = useState("")
  const [destBinId, setDestBinId] = useState("")
  const [qty, setQty] = useState("")
  const [createdBy, setCreatedBy] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)

  const { data: locData } = useLocations({ perPage: 100 })
  const { data: binData, isLoading: binsLoading } = useLocationBins(locationId)
  const transfer = useBinTransfer()

  const locationOptions = useMemo(
    () => (locData?.items ?? []).map((l) => ({ value: l.id, label: l.locationName })),
    [locData]
  )
  const binOptions = useMemo(
    () => (binData?.items ?? []).map((b) => ({ value: b.id, label: b.binFinalCode })),
    [binData]
  )

  const qtyNum = Number(qty)
  const canSubmit =
    !!locationId && !!item && !!sourceBinId && !!destBinId &&
    sourceBinId !== destBinId && qtyNum > 0 && !!createdBy.trim()

  const handleSubmit = () => {
    if (!canSubmit || !item) return
    transfer.mutate(
      {
        item_id: item.itemId,
        location_id: locationId,
        source_bin_id: sourceBinId,
        destination_bin_id: destBinId,
        qty: qtyNum,
        created_by: createdBy.trim(),
      },
      { onSuccess: () => router.push(LIST_HREF) }
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title="Pindah Antar Bin"
        backHref={LIST_HREF}
        breadcrumb={[
          { label: "Persediaan" },
          { label: "Transaksi Stok", href: LIST_HREF },
          { label: "Pindah Antar Bin" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push(LIST_HREF)}>
            <ArrowLeftIcon className="mr-1.5 h-4 w-4" /> Kembali
          </Button>
        }
      />

      <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Gudang <span className="text-red-500">*</span></Label>
            <Combobox
              options={locationOptions}
              value={locationId}
              onChange={(v) => { setLocationId(v ?? ""); setSourceBinId(""); setDestBinId("") }}
              placeholder="Pilih gudang…"
              searchPlaceholder="Cari gudang…"
              className="sm:max-w-md"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Produk <span className="text-red-500">*</span></Label>
            {item ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 sm:max-w-md">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.sku}{item.variantLabel ? ` · ${item.variantLabel}` : ""}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>Ganti</Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setPickerOpen(true)} className="justify-start gap-2 sm:max-w-md">
                <PackageSearchIcon className="h-4 w-4" />
                Pilih produk…
              </Button>
            )}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3 sm:max-w-xl">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Bin Asal <span className="text-red-500">*</span></Label>
              <Combobox
                options={binOptions}
                value={sourceBinId}
                onChange={(v) => setSourceBinId(v ?? "")}
                placeholder={binsLoading ? "Memuat…" : "Bin asal…"}
                searchPlaceholder="Cari bin…"
                disabled={!locationId || binsLoading}
              />
            </div>
            <ArrowRightIcon className="mb-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Bin Tujuan <span className="text-red-500">*</span></Label>
              <Combobox
                options={binOptions.filter((b) => b.value !== sourceBinId)}
                value={destBinId}
                onChange={(v) => setDestBinId(v ?? "")}
                placeholder={binsLoading ? "Memuat…" : "Bin tujuan…"}
                searchPlaceholder="Cari bin…"
                disabled={!locationId || binsLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Qty <span className="text-red-500">*</span></Label>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Dipindahkan oleh <span className="text-red-500">*</span></Label>
              <UserSelect value={createdBy} onChange={setCreatedBy} defaultToSelf placeholder="Nama petugas" />
            </div>
          </div>
        </div>
      </LiquidGlass>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push(LIST_HREF)}>Batal</Button>
        <Button onClick={handleSubmit} disabled={!canSubmit || transfer.isPending}>
          {transfer.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          Pindahkan
        </Button>
      </div>

      <ProductPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={(products) => {
          if (products[0]) setItem(products[0])
          setPickerOpen(false)
        }}
      />
    </div>
  )
}
