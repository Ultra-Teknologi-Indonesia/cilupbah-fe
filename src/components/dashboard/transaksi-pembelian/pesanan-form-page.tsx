"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  PlusIcon,
  Trash2Icon,
  SearchIcon,
  PackageIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { useContacts } from "@/hooks/kontak-pemasok/use-contacts"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { useMasterProducts } from "@/hooks/master-produk/use-master-products"
import {
  usePurchaseOrderDetail,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
} from "@/hooks/transaksi-pembelian/use-purchase-orders"
import type { PurchaseOrderItemFormData } from "@/types/transaksi-pembelian/purchase-order"

interface Props {
  mode: "create" | "edit"
  id?: string
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val)
}

const EMPTY_ITEM: PurchaseOrderItemFormData = {
  item_id: "",
  product_name: "",
  product_sku: "",
  qty: 1,
  unit_price: 0,
  disc: 0,
}

export function PesananFormPage({ mode, id }: Props) {
  const router = useRouter()
  const { data: existingPO, isLoading: loadingPO } = usePurchaseOrderDetail(mode === "edit" ? id : undefined)
  const createMut = useCreatePurchaseOrder()
  const updateMut = useUpdatePurchaseOrder()

  const [contactId, setContactId] = useState("")
  const [locationId, setLocationId] = useState("")
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0])
  const [refNo, setRefNo] = useState("")
  const [paymentTerm, setPaymentTerm] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<PurchaseOrderItemFormData[]>([{ ...EMPTY_ITEM }])
  const [productSearch, setProductSearch] = useState("")

  const { data: contactsData } = useContacts({ per_page: 100, "filter[type]": "SUPPLIER" })
  const { data: locData } = useLocations({ perPage: 100 })
  const { data: productsData } = useMasterProducts({ search: productSearch, perPage: 20 })

  useEffect(() => {
    if (mode === "edit" && existingPO) {
      setContactId(existingPO.contact_id)
      setLocationId(existingPO.location_id)
      setOrderDate(existingPO.order_date?.split("T")[0] ?? "")
      setRefNo(existingPO.ref_no ?? "")
      setPaymentTerm(existingPO.payment_term?.toString() ?? "")
      setNotes(existingPO.notes ?? "")
      setItems(existingPO.items.map((it) => ({
        item_id: it.item_id,
        product_name: it.product?.name ?? "",
        product_sku: it.product?.sku ?? "",
        description: it.description ?? "",
        unit: it.unit ?? "",
        qty: it.qty,
        unit_price: Number(it.unit_price),
        disc: Number(it.disc),
      })))
    }
  }, [mode, existingPO])

  const contactOptions = useMemo(() =>
    (contactsData?.items ?? []).map((c) => ({ value: c.id, label: c.name })),
  [contactsData])

  const locationOptions = useMemo(() =>
    (locData?.items ?? []).map((l) => ({ value: l.id, label: l.locationName })),
  [locData])

  const productOptions = useMemo(() => {
    const opts: { value: string; label: string; sku: string; name: string }[] = []
    for (const p of productsData?.items ?? []) {
      for (const v of p.variants) {
        opts.push({ value: v.itemId, label: `${v.sku} - ${p.itemName}`, sku: v.sku, name: p.itemName })
      }
    }
    return opts
  }, [productsData])

  const updateItem = useCallback((index: number, field: string, value: string | number) => {
    setItems((prev) => prev.map((it, i) => i === index ? { ...it, [field]: value } : it))
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const addProduct = useCallback((variantId: string) => {
    const opt = productOptions.find((o) => o.value === variantId)
    if (!opt) return
    const exists = items.findIndex((it) => it.item_id === variantId)
    if (exists >= 0) {
      updateItem(exists, "qty", items[exists].qty + 1)
      return
    }
    setItems((prev) => [...prev.filter((it) => it.item_id), {
      item_id: opt.value,
      product_name: opt.name,
      product_sku: opt.sku,
      qty: 1,
      unit_price: 0,
      disc: 0,
    }])
    setProductSearch("")
  }, [productOptions, items, updateItem])

  const totals = useMemo(() => {
    let subTotal = 0
    let totalDisc = 0
    let count = 0
    for (const it of items) {
      if (!it.item_id) continue
      const line = it.qty * it.unit_price
      const disc = line * (it.disc / 100)
      subTotal += line
      totalDisc += disc
      count++
    }
    return { subTotal, totalDisc, grandTotal: subTotal - totalDisc, count }
  }, [items])

  const canSubmit = contactId && locationId && orderDate && items.some((it) => it.item_id)
  const isPending = createMut.isPending || updateMut.isPending

  function handleSubmit() {
    if (!canSubmit) return
    const payload = {
      contact_id: contactId,
      location_id: locationId,
      order_date: orderDate,
      ref_no: refNo || undefined,
      payment_term: paymentTerm ? Number(paymentTerm) : null,
      notes: notes || undefined,
      items: items.filter((it) => it.item_id).map((it) => ({
        item_id: it.item_id,
        description: it.description,
        unit: it.unit,
        qty: it.qty,
        unit_price: it.unit_price,
        disc: it.disc,
      })),
    }

    if (mode === "edit" && id) {
      updateMut.mutate({ id, data: payload }, {
        onSuccess: () => router.push(`/dashboard/transaksi-pembelian/pesanan/${id}`),
      })
    } else {
      createMut.mutate(payload, {
        onSuccess: (data) => router.push(`/dashboard/transaksi-pembelian/pesanan/${data?.id ?? ""}`),
      })
    }
  }

  if (mode === "edit" && loadingPO) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/dashboard/transaksi-pembelian">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">
          {mode === "create" ? "Tambah Pesanan Pembelian" : `Edit ${existingPO?.po_number ?? ""}`}
        </h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Pemasok *</Label>
                <Combobox
                  options={contactOptions}
                  value={contactId}
                  onChange={(v) => setContactId(v ?? "")}
                  placeholder="Pilih pemasok"
                  searchPlaceholder="Cari pemasok..."
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Lokasi *</Label>
                <Combobox
                  options={locationOptions}
                  value={locationId}
                  onChange={(v) => setLocationId(v ?? "")}
                  placeholder="Pilih lokasi"
                  searchPlaceholder="Cari lokasi..."
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal *</Label>
                <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label>No. Referensi</Label>
                <Input value={refNo} onChange={(e) => setRefNo(e.target.value)} placeholder="No. ref" className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label>Termin (hari)</Label>
                <Input type="number" min={0} value={paymentTerm} onChange={(e) => setPaymentTerm(e.target.value)} placeholder="0" className="bg-background" />
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <Label>Keterangan</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan pesanan..." rows={2} className="bg-background" />
            </div>
          </LiquidGlass>

          <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Cari produk (SKU / nama)..."
                  className="bg-background pl-9"
                />
              </div>
            </div>

            {productSearch && productOptions.length > 0 && (
              <div className="mb-4 max-h-48 overflow-y-auto rounded-lg border border-border/40 bg-background">
                {productOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => addProduct(opt.value)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
                  >
                    <PackageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Produk</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground w-32">Harga</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground w-20">Qty</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground w-20">Diskon%</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground w-32">Total</th>
                    <th className="px-3 py-2.5 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {items.filter((it) => it.item_id).map((item, idx) => {
                    const lineTotal = item.qty * item.unit_price
                    const discAmount = lineTotal * (item.disc / 100)
                    const total = lineTotal - discAmount
                    return (
                      <tr key={item.item_id} className="border-b border-border/20 last:border-0">
                        <td className="px-3 py-2">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-xs text-muted-foreground">{item.product_sku}</div>
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            value={item.unit_price || ""}
                            onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))}
                            className="h-8 text-right bg-background tabular-nums"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) => updateItem(idx, "qty", Math.max(1, Number(e.target.value)))}
                            className="h-8 text-right bg-background tabular-nums"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={item.disc || ""}
                            onChange={(e) => updateItem(idx, "disc", Number(e.target.value))}
                            className="h-8 text-right bg-background tabular-nums"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-medium tabular-nums">
                          {formatCurrency(total)}
                        </td>
                        <td className="px-3 py-2">
                          <Button variant="ghost" size="icon-sm" onClick={() => removeItem(idx)} className="text-destructive hover:text-destructive">
                            <Trash2Icon className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {items.filter((it) => it.item_id).length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                        <PackageIcon className="mx-auto mb-2 h-8 w-8" />
                        <p className="text-sm">Cari dan tambahkan produk di atas</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </LiquidGlass>
        </div>

        <div className="flex flex-col gap-4">
          <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5 sticky top-4">
            <h3 className="mb-4 font-semibold">Rincian</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jumlah Produk</span>
                <span className="font-medium">{totals.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatCurrency(totals.subTotal)}</span>
              </div>
              {totals.totalDisc > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Diskon</span>
                  <span className="tabular-nums">-{formatCurrency(totals.totalDisc)}</span>
                </div>
              )}
              <div className="border-t border-border/40 pt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Button onClick={handleSubmit} disabled={!canSubmit || isPending} variant="primary" className="w-full">
                {isPending ? "Menyimpan..." : mode === "create" ? "Simpan Pesanan" : "Perbarui Pesanan"}
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/transaksi-pembelian">Batal</Link>
              </Button>
            </div>
          </LiquidGlass>
        </div>
      </div>
    </div>
  )
}
