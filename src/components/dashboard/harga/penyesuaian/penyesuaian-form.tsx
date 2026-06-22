"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  ImageIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  SearchXIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { useOnlinePrices } from "@/hooks/harga/use-prices"
import { useCreateAdjustment } from "@/hooks/harga/use-adjustments"
import type { OnlinePriceRow, ChannelHeader } from "@/types/harga/price"

interface FormItem {
  variantId: string
  productName: string
  sku: string
  thumbnail: string | null
  variationValues: string[]
  sellPrice: number
  prices: Record<string, number>
}

const formatIDR = (value: number | null) =>
  value === null
    ? "—"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(value)

export function PenyesuaianForm() {
  const router = useRouter()
  const [date, setDate] = React.useState<Date>(new Date())
  const [type, setType] = React.useState<"online" | "offline">("online")
  const [notes, setNotes] = React.useState("")
  const [selectedStoreIds, setSelectedStoreIds] = React.useState<string[]>([])
  const [formItems, setFormItems] = React.useState<FormItem[]>([])
  const [pickerOpen, setPickerOpen] = React.useState(false)

  const { data: stores = [] } = useConnectedStores()
  const { data: locationsData } = useLocations({ perPage: 100 })
  const locations = locationsData?.items ?? []

  const createMutation = useCreateAdjustment()

  const storeOptions = React.useMemo(
    () => stores.map((s) => ({ id: s.shop_id, name: s.shop_name, channelName: s.channel?.name ?? "" })),
    [stores]
  )

  const locationOptions = React.useMemo(
    () => locations.map((l) => ({ id: l.id, name: l.locationName })),
    [locations]
  )

  const targetOptions = type === "online" ? storeOptions : locationOptions.map((l) => ({ id: l.id, name: l.name, channelName: "" }))

  const selectedTargets = targetOptions.filter((t) => selectedStoreIds.includes(t.id))

  const toggleTarget = (id: string) => {
    setSelectedStoreIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const removeTarget = (id: string) => {
    setSelectedStoreIds((prev) => prev.filter((x) => x !== id))
  }

  const addProduct = (row: OnlinePriceRow) => {
    if (formItems.some((fi) => fi.variantId === row.variantId)) return
    const prices: Record<string, number> = {}
    selectedStoreIds.forEach((sid) => {
      const p = row.prices.find((pr) => pr.channel_shop_id === sid)
      prices[sid] = p?.price ?? row.sellPrice
    })
    setFormItems((prev) => [
      ...prev,
      {
        variantId: row.variantId,
        productName: row.productName,
        sku: row.sku,
        thumbnail: row.thumbnail,
        variationValues: row.variationValues,
        sellPrice: row.sellPrice,
        prices,
      },
    ])
  }

  const removeProduct = (variantId: string) => {
    setFormItems((prev) => prev.filter((fi) => fi.variantId !== variantId))
  }

  const updatePrice = (variantId: string, targetId: string, price: number) => {
    setFormItems((prev) =>
      prev.map((fi) =>
        fi.variantId === variantId
          ? { ...fi, prices: { ...fi.prices, [targetId]: price } }
          : fi
      )
    )
  }

  const handleSave = () => {
    if (formItems.length === 0) return

    const items = formItems.flatMap((fi) =>
      selectedStoreIds.map((targetId) => ({
        variant_id: fi.variantId,
        ...(type === "online"
          ? { channel_shop_id: targetId }
          : { location_id: targetId }),
        new_price: fi.prices[targetId] ?? fi.sellPrice,
      }))
    )

    createMutation.mutate(
      {
        adjustment_date: format(date, "yyyy-MM-dd"),
        type,
        notes: notes || undefined,
        items,
      },
      {
        onSuccess: () => {
          router.push("/dashboard/harga/penyesuaian")
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="text-lg font-semibold">Penyesuaian</h2>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={createMutation.isPending || formItems.length === 0}>
              {createMutation.isPending && <Loader2Icon className="size-4 animate-spin" />}
              Simpan
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <XIcon className="size-5" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Tipe</Label>
              <Select value={type} onValueChange={(v) => { setType(v as "online" | "offline"); setSelectedStoreIds([]); setFormItems([]) }}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Tanggal</Label>
              <DatePicker value={date} onChange={(d) => d && setDate(d)} className="bg-background" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>No. Penyesuaian</Label>
              <Input value="[auto]" disabled className="bg-muted/40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Keterangan</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tulis keterangan disini"
                rows={3}
                className="bg-background"
              />
            </div>
          </div>

          {/* Right column — target picker */}
          <div className="flex flex-col gap-1.5">
            <Label>{type === "online" ? "Toko *" : "Lokasi *"}</Label>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-background p-2 min-h-[80px]">
              {selectedTargets.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {t.name}
                  <button type="button" onClick={() => removeTarget(t.id)} className="hover:text-destructive">
                    <XIcon className="size-3" />
                  </button>
                </span>
              ))}
              {selectedStoreIds.length < targetOptions.length && (
                <span className="text-xs text-muted-foreground self-center">
                  +{targetOptions.length - selectedStoreIds.length} Pilih {type === "online" ? "toko" : "lokasi"}
                </span>
              )}
            </div>
            <div className="mt-1 flex max-h-[200px] flex-col gap-0.5 overflow-y-auto rounded-lg border border-border/60 bg-background p-2">
              {targetOptions.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedStoreIds.includes(t.id)}
                    onCheckedChange={() => toggleTarget(t.id)}
                  />
                  <span className="truncate">{t.name}</span>
                  {"channelName" in t && t.channelName && (
                    <span className="ml-auto text-xs text-muted-foreground">{t.channelName}</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      </LiquidGlass>

      {/* Product table */}
      <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produk</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Harga Default</th>
                {selectedTargets.map((t) => (
                  <th key={t.id} className="px-4 py-3 text-right font-medium text-muted-foreground min-w-[160px]">
                    <div className="truncate text-xs">{t.name}</div>
                  </th>
                ))}
                <th className="w-12 px-2" />
              </tr>
            </thead>
            <tbody>
              {formItems.map((fi) => (
                <tr key={fi.variantId} className="border-b border-border/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                        {fi.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={fi.thumbnail} alt={fi.productName} className="size-full object-cover" />
                        ) : (
                          <ImageIcon className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{fi.productName}</div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="font-mono">{fi.sku}</span>
                          {fi.variationValues.length > 0 && (
                            <>
                              <span className="text-border">·</span>
                              <span>{fi.variationValues.join(" / ")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatIDR(fi.sellPrice)}</td>
                  {selectedTargets.map((t) => (
                    <td key={t.id} className="px-4 py-3">
                      <Input
                        type="number"
                        min={0}
                        value={fi.prices[t.id] ?? ""}
                        onChange={(e) => updatePrice(fi.variantId, t.id, Number(e.target.value))}
                        className="h-8 w-full text-right tabular-nums"
                      />
                    </td>
                  ))}
                  <td className="px-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeProduct(fi.variantId)}
                    >
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {formItems.length === 0 && (
                <tr>
                  <td
                    colSpan={2 + selectedTargets.length + 1}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Belum ada produk. Klik &quot;Tambah Baru&quot; untuk menambahkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => setPickerOpen(true)}
            disabled={selectedStoreIds.length === 0}
          >
            <PlusIcon className="size-4" />
            Tambah Baru
          </Button>
          {selectedStoreIds.length === 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              Pilih {type === "online" ? "toko" : "lokasi"} terlebih dahulu
            </span>
          )}
        </div>
      </LiquidGlass>

      <ProductPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={addProduct}
        existingIds={formItems.map((fi) => fi.variantId)}
      />
    </div>
  )
}

function ProductPickerDialog({
  open,
  onOpenChange,
  onPick,
  existingIds,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (row: OnlinePriceRow) => void
  existingIds: string[]
}) {
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSearchInput("")
      setSearch("")
    }
    onOpenChange(next)
  }

  const { data, isLoading } = useOnlinePrices({
    search: search || undefined,
    per_page: 10,
  })
  const items = data?.items ?? []

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Pilih produk</DialogTitle>
          <DialogDescription>
            Pilih produk yang akan disesuaikan harganya.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama / SKU…"
            className="h-9 rounded-full border-border bg-background pl-9"
          />
        </div>

        <div className="max-h-80 overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin motion-reduce:animate-none" />
              Memuat produk…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <SearchXIcon className="size-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Produk tidak ditemukan</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {items.map((row) => {
                const added = existingIds.includes(row.variantId)
                return (
                  <li key={row.variantId}>
                    <button
                      type="button"
                      disabled={added}
                      onClick={() => { onPick(row); handleOpenChange(false) }}
                      className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/60 disabled:opacity-50"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                        {row.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.thumbnail} alt={row.productName} className="size-full object-cover" />
                        ) : (
                          <ImageIcon className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{row.productName}</div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="font-mono">{row.sku}</span>
                          {row.variationValues.length > 0 && (
                            <>
                              <span>·</span>
                              <span>{row.variationValues.join(" / ")}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right tabular-nums text-sm text-muted-foreground">
                        {formatIDR(row.sellPrice)}
                      </div>
                      {added && (
                        <span className="text-[10px] text-muted-foreground">Sudah ditambah</span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
